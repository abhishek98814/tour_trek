const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    servuce:'gmail',
    auth:{
        uesr:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})


async function sendOTPEmail(toEmail, otp, purpose = 'verification'){
    const subjectMap = {
        verification: 'Verify your trek Acc',
        reset: 'Reset Your Trek pass'
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to:toEmail,
        subject:subjectMap[purpose] || 'Your OTP Code',

        html:  `<h2>Your OTP is: ${otp} </h2><p>This code expires in 5 minute. </p>`
    })
}

module.exports = sendOTPEmail;