'use server'
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';

export async function POST(request) {
    try {
        const {name, price, date, vendor, category} = await request.json();
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

        return NextResponse.json({expenses: user.transactions}, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Error fetching transactions"}, {status: 500});
    }
}

export async function DELETE(request) {
    try {
      const {transactionId} = await request.json();
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
  
      if (!user) return NextResponse.json({message: "User not found"}, {status: 404});
  
      const transactionIndex = user.transactions.findIndex(txn => txn._id.toString() === transactionId);
      if (transactionIndex === -1) {
        return NextResponse.json({message: "Transaction not found"}, {status: 404});
      }
  
      user.transactions.splice(transactionIndex, 1);
      await user.save();
  
      return NextResponse.json({message: "Transaction deleted successfully"}, {status: 200});
    } catch (error) {
      console.error(error);
      return NextResponse.json({message: "Error deleting transaction"}, {status: 500});
    }
  }
  