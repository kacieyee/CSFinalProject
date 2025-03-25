'use server'
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function postTransaction(request) {
    try {
        const {token, name, price, date, vendor, category} = await request.json();

        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.username;

        const user = await User.findOne({username});
        if (!user) {
            return NextResponse.json({message: "User not found!"}, {status: 404});
        }

        const transaction = {
            name,
            price: Number(price),
            date: new Date(date),
            vendor,
            category
        };

        user.transactions.push(transaction);
        await user.save();

        return NextResponse.json({message: "Transaction added successfully"}, {status: 201});
    } catch (err) {
        console.log(err);
        return NextResponse.json({message: "Error processing transaction"}, {status: 500});
    }
}

export async function POST(request) {
    return postTransaction(request);
}

export async function GET(request) {
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({message: "Unauthorized"}, {status: 401});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({username: decoded.username});

        if (!user) return NextResponse.json({message: "User not found!"}, {status: 404});

        return NextResponse.json({expenses: user.transactions}, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Error fetching transactions"}, {status: 500});
    }
}