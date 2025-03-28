// src/models/User.js
import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     trim: true,
    //     lowercase: true,
    // },
    // password: {
    //     type: String,
    //     required: true,
    //     minlength: 6,
    // },


    email: { type: String, required: true, unique: true }, // ✅ Change "username" to "email"
    password: { type: String, required: true },



});

// Hash password before saving
// UserSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

export default mongoose.model("users", UserSchema);
