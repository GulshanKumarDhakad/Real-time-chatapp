import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async(req,res)=> {

    const {email} = req.body;
    //console.log(req.body);

    // putiing a rate limiter
    const rateLimnitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimnitKey);

    if(rateLimit){
        res.status(429).json({
            message:"too many requests. Please wait before requesting new otp"
        });
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 300,
    });

    await redisClient.set(rateLimnitKey, "true", {
        EX:60,
    });

    const message = {
        to: email,
        subject: "Your otp code",
        body: `Your otp is ${otp}. It is valid for 5 minutes.`
    }

    await publishToQueue("send-otp", message);

    res.status(200).json({
        message: "OTP send to your mail"
    });

});

export const verifyUser = TryCatch(async(req,res) =>{
    const {email, otp:enteredOtp} = req.body;

    if(!email || !enteredOtp){
        res.status(400).json({
            message:"email and otp required"
        });
        return;
    }

    const otpKey = `otp:${email}`;

    const storedOtp = await redisClient.get(otpKey);

    if(!otpKey || storedOtp!==enteredOtp){
        res.status(400).json({
            message:"Invalid or expired otp"
        });
        return;
    }

    await redisClient.del(otpKey);

    let user = await User.findOne({email});

    if(!user){
        const name = email.slice(0,8);
        user = await User.create({ name, email});
    }

    const token = generateToken(user);

    res.json({
        message:"user verified",
        user,
        token,
    });
});

export const myProfile = TryCatch((req: AuthenticatedRequest, res)=>{
    const user = req.user;

    res.json(user);
})

export const updateName = TryCatch(async(req: AuthenticatedRequest, res)=>{
    const user = await User.findById(req.user?._id);

    if(!user){
        res.status(404).json({
            message:"Please Login"
        })

        return;
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
        message:"updated user",
        user,
        token
    });
})

export const getAllUsers = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const users = await User.find();

    res.json(users);
});

export const getAUser = TryCatch(async(req, res)=>{
    const user = await User.findById(req.params.id);

    res.json(user);
});

