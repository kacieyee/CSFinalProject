'use server'
import User from "@/models/User";
import connectToDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';
import jwt from "jsonwebtoken";

connectToDB();

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(request) {
    try {
        const {username, password} = await request.json();
        const newUser = new User({username, password}); 

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({message: "Username already taken. "}, {status: 400});
        }

        await newUser.save();
        return NextResponse.json({username: newUser.username}, {status: 201});
    } catch(err) {
        console.log(err);
    }
}

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = await jwtVerify(token, new TextEncoder().encode(secret));
        const user = await User.findOne({username: decoded.payload.username});

        if (!user) {
            return NextResponse.json({message: "User not found!"}, {status: 404});
        }

        return NextResponse.json({
            username: user.username,
            password: user.password,
            budgets: user.budgets,
        }, {status: 200});

    } catch (err) {
        console.error("Error fetching profile:", err);
        return NextResponse.json({message: "Error fetching profile"}, {status: 500});
    }
}

export async function PATCH(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = await jwtVerify(token, new TextEncoder().encode(secret));
        const user = await User.findOne({username: decoded.payload.username});

        if (!user) {
            return NextResponse.json({message: "User not found"}, {status: 404});
        }

        const {newUsername, newPassword} = await request.json();

        if (newUsername) {
            const existingUser = await User.findOne({username: newUsername});
            if (existingUser) {
                return NextResponse.json({message: "Username already taken. "}, {status: 400});
            }
            user.username = newUsername;
        }

        if (newPassword) {
            user.password = newPassword;
        }

        await user.save();

        return NextResponse.json({message: "Profile updated successfully"}, {status: 200});

    } catch (err) {
        console.error("Error updating profile:", err);
        return NextResponse.json({message: "Error updating profile"}, {status: 500});
    }
}

async function userLogin(username, password) {
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