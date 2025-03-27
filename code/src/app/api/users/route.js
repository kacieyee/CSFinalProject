'use server'
import User from "@/models/User";
import connectToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connectToDB();

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(request) {
    try {
        const {username, password} = await request.json();
        const newUser = new User({username, password}); 
        await newUser.save();
        return NextResponse.json({username: newUser.username}, {status: 201});
    } catch(err) {
        console.log(err);
    }
}

export async function userLogin(username, password) {
    try {
        const user = await User.findOne({username});
        if (!user) {
            return {status: 2}; 
        } else if (user.password != password) {
            return {status: 1};
        } else {
            const token = jwt.sign(
                {username: user.username},
                SECRET_KEY,
                {expiresIn: "1h"}
            );

            return {status: 0, token};
        }
    } catch(err) {
        console.log(err);
        return -1;
    }
}