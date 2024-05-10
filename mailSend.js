 const { generateOTP } = require('./utils.js');
const nodemailer = require('nodemailer');
async function sendOTPEmail(to_email) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: true, // Set secure to true
        auth: {
            user: "2105ksharma@gmail.com",
            pass: "kzpuouvguilcbmcz"
        }
    });

    try {
        // Generate OTP
        const otp = generateOTP();

        let info = await transporter.sendMail({
            to: to_email,
            from: "2105ksharma@gmail.com",
            subject: "Your OTP for SurakShitMat",
            html: `<h2 style="color:red">Your OTP for SurakShitMat</h2>
                   <p>Your OTP is: <strong>${otp}</strong></p>`
        });

        if (info.messageId) {
            return otp; // Return the OTP if email sent successfully
        } else {
            return false; // Return false if email failed to send
        }
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false; // Return false if an error occurred
    }
}
// Function to send the verification email
async function sendVerifyMail(to_email) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: false,
        auth: {
            user: "2105ksharma@gmail.com",
            pass: "kzpuouvguilcbmcz"
        }
    });

    let info = await transporter.sendMail({
        to: to_email,
        from: "2105ksharma@gmail.com",
        subject: "Verify Your Email for SurakShitMat",
        html: `<h2 style="color:red">Please click on the link to verify your Email Id</h2>
               <a href="http://localhost:3000/verifyemail?email=${encodeURIComponent(to_email)}">Click Here to Verify Your Email</a>`
    });

    if (info.messageId)
        return true; // Email sent successfully
    else
        return false;
}
const verifyOTP = (enteredOTP, storedOTP) => {
    // Validate the entered OTP
    return enteredOTP.trim() !== '' && enteredOTP === storedOTP;
}
module.exports = {
    sendOTPEmail,
    sendVerifyMail,
    generateOTP, 
    verifyOTP
};
