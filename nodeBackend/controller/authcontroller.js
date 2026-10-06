
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require('../model/user')
const sendOTPEmail = require('../services/mailers')
const {generateOTP, getOtpExpiry} = require('../services/otpServices')

exports.register = async(req, res)=>{
try{

    const {name, email, password, role} = req.body;

    const existingUser = await User.findOne({email})

    if(existingUser){
        return res.status(400).json({error:"Email already register"})
    }

    const hashedPass = await bcrypt.hash(password, 10)

    const otp = generateOTP()

    const user = await User.create({
        name,
        email,
        password:hashedPass,
        role:role || 'trekker',
        otp, 
        otpExpiresDate:getOtpExpiry()
    })

}catch(err){
    console.log(err)

}

}