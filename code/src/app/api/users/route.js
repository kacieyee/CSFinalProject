'use server'
import User from "@/models/User";
import connectToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

connectToDB()

export async function postUser(username, password) {
    try {
        const newUser = new User({username, password}); 
        await newUser.save();
        return NextResponse.json(
            {username: newUser.username}, {status: 201})
    } catch(err) {
        console.log(err)
    }
}

export async function userLogin(username, password) {
    try {
        const user = await User.findOne({username});
        if (!user) {
            return 2;
        } else if (user.password != password) {
            return 1;
        } else {
            return 0;
        }
    } catch(err) {
        console.log(err)
        return -1;
    }
}