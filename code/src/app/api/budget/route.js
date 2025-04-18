'use server'
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';

const intervalMultipliers = {
    daily: 30,
    weekly: 4,
    biweekly: 2,
    monthly: 1,
    yearly: 1 / 12,
};

function normalizeTo(targetInterval, amount, sourceInterval) {
    const monthlyValue = amount * intervalMultipliers[sourceInterval];
    return monthlyValue / intervalMultipliers[targetInterval];
}

function calculateTempGoal(budgets, targetInterval) {
    let total = 0;
  
    for (const budget of budgets) {
      if (budget.category !== "total expenses" && budget.category !== "temp total") {
        const value = normalizeTo(targetInterval, budget.goal, budget.interval);
        total += value;
      }
    }
  
    return total;
}

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
            category: category.toLowerCase(),
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
        if (newInterval) {
            budget.interval = String(newInterval);

            if (category.toLowerCase() === "total expenses") {
                const tempTotal = user.budgets.find(b => b.category === "temp total");
                if (tempTotal) {
                    const tempGoal = await calculateTempGoal(user.budgets, budget.interval);

                    if (budget.goal == tempTotal.goal) {
                        budget.goal = 0;
                    }

                    tempTotal.goal = tempGoal;
                }

                if (budget.goal < (tempTotal?.goal || 0)) {
                    budget.goal = tempTotal?.goal || 0;
                }
            }
        }

        const totalExpenses = user.budgets.find(b => b.category === "total expenses");
        const tempTotal = user.budgets.find(b => b.category === "temp total");

        if (tempTotal && totalExpenses) {
            const tempGoal = await calculateTempGoal(user.budgets, totalExpenses.interval);

            if (totalExpenses.goal == tempTotal.goal) {
                totalExpenses.goal = 0;
            }

            tempTotal.goal = tempGoal;

            if (totalExpenses.goal < tempGoal) {
                totalExpenses.goal = tempGoal;
            }
        }

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

        const totalExpenses = user.budgets.find(b => b.category === "total expenses");
        const tempTotal = user.budgets.find(b => b.category === "temp total");

        if (tempTotal && totalExpenses) {
            const tempGoal = await calculateTempGoal(user.budgets, totalExpenses.interval);

            if (totalExpenses.goal == tempTotal.goal) {
                totalExpenses.goal = 0;
            }

            tempTotal.goal = tempGoal;

            if (totalExpenses.goal < tempGoal) {
                totalExpenses.goal = tempGoal;
            }
        }

        await user.save();

        return NextResponse.json({message: "Budget deleted successfully"}, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Error deleting budget"}, {status: 500});
    }
}