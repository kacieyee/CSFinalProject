import connectToDB from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectToDB()
        const {username, password} = await request.json()
        const newUser = new User({username, password})
        await newUser.save()
        return NextResponse.json({newUser}, {status: 201})
    } catch(err) {
        console.log(err)
    }
}