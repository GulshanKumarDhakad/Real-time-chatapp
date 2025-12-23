import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import {createClient} from "redis"
import userRoutes from './routes/user.js'
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";



dotenv.config();
connectDb();
connectRabbitMQ();

//@ts-ignore
export const redisClient= createClient({
        url:process.env.REDIS_URL,
});

redisClient
    .connect()
    .then(()=>{console.log("redis connected successfully")})
    .catch(console.error);


const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT;


app.use("/api/v1", userRoutes);



app.listen(port,()=>{
    console.log("listening to the port->",port);
})  

