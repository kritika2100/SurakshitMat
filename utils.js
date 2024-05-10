const otpGenerator = require('otp-generator')
const generateOTP=()=>{
    const OTP=otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });
    // console.log("otp which is generated");
    // console.log(OTP);
    return OTP;
}
module.exports.generateOTP = generateOTP; 