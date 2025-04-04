'use server'
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';

export async function POST(request) {
    try {
        const {category, goal, interval} = await request.json();
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

        const budget = {
            category,
            goal: Number(goal),
            interval: String(interval)
        };

        user.budgets.push(budget);
        await user.save();

        return NextResponse.json({message: "Budget added successfully"}, {status: 201});
    } catch (err) {
        console.log(err);
        return NextResponse.json({message: "Error processing budget"}, {status: 500});
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

        if (!user) return NextResponse.json({message: "User not found!"}, {status: 404});

        return NextResponse.json({expenses: user.budgets}, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Error fetching budgets"}, {status: 500});
    }
}

export async function PATCH(request) {
    try {
        const { category, newGoal, newInterval } = await request.json();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded = await jwtVerify(token, new TextEncoder().encode(secret));
        const user = await User.findOne({username: decoded.payload.username});

        if (!user) {
            return NextResponse.json({message: "User not found!"}, {status: 404});
        }

        const budget = user.budgets.find(b => b.category === category);
        if (!budget) {
            return NextResponse.json({message: "Budget category not found!"}, {status: 404});
        }

        if (newGoal !== undefined) budget.goal = Number(newGoal);
        if (newInterval) budget.interval = String(newInterval);

        await user.save();

        return NextResponse.json({message: "Budget updated successfully", budget}, {status: 200});
    } catch (err) {
        console.error("Error updating budget:", err);
        return NextResponse.json({message: "Error updating budget"}, {status: 500});
    }
}

export async function DELETE(request) {
    try {
        const {category} = await request.json();
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

        user.budgets = user.budgets.filter(budget => budget.category !== category);
        await user.save();

        return NextResponse.json({message: "Budget deleted successfully"}, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Error deleting budget"}, {status: 500});
    }
}
