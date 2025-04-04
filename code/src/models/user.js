import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    date: {type: Date, required: true},
    vendor: {type: String, required: true},
    category: {type: String, required: true}
});

const budgetSchema = new Schema({
    category: {type: String, required: true},
    goal: {type: Number, required: true},
    interval: {type: String,
        enum: ["daily", "weekly", "biweekly", "monthly", "yearly"], 
        default: "monthly"
    }
});

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    transactions: [transactionSchema],
    budgets: [budgetSchema]
});

userSchema.pre("save", function(next) {
    if (this.isNew && this.budgets.length === 0) {
        this.budgets = [
            { category: "savings", goal: 0, interval: "monthly" },
            { category: "total expenses", goal: 0, interval: "monthly" }
        ];
    }
    next();
});

const User = mongoose.models["user-info"] || mongoose.model('user-info', userSchema);

export default User;