import mongoose from "mongoose";

const connectToDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to Mongo")
    } catch(err) {
        console.log(err)
    }
}

export default connectToDB