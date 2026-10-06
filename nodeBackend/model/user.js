
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name:String,

    email:{type:String, unique:true, required:true},
    password:{type:String, required:true},
    isVerified:{type:Boolean, default:false},
    role:{type:String, enum:['trekker', 'guide', 'admin'], default:'trekker'},
    otp:String,
    otpExpiresDate:Date
})

module.exports = mongoose.model('User', userSchema)
