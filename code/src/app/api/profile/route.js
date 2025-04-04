'use server';
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';

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
