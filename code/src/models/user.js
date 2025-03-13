import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

const User = mongoose.models["user-info"] || mongoose.model('user-info', userSchema);

export default User