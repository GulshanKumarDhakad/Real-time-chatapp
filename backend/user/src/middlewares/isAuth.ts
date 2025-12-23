import { IUser } from "../model/User.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?:IUser | null;
};

export const isAuth = async(req:AuthenticatedRequest, res:Response, next:NextFunction):
Promise<void> =>{
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"Please Login - No auth Header",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        //@ts-ignore
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;

        next();
    } catch (error) {
        res.status(401).json({
            message:"Please Login - JWT error"
        });
    }
}

