import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    date: {type: Date, required: true},
    vendor: {type: String, required: true},
    category: {type: String, required: true}
});

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    transactions: [transactionSchema]
});

const User = mongoose.models["user-info"] || mongoose.model('user-info', userSchema);

export default User;