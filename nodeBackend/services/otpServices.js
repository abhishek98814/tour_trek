function generateOTP(){
    return Math.floor(100000 + Math.random() * 90000).toString();
}


function getOtpExpiry(minute = 6){
    return new Date(Date.now() + minute * 60 * 1000)
}


module.exports = {generateOTP, getOtpExpiry}