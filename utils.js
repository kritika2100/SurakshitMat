// utils.js

// Function to generate a random 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
function validateOTP(enteredOTP, storedOTP) {
    // Compare the entered OTP with the stored OTP
    return enteredOTP === storedOTP;
}

module.exports = {
    generateOTP, validateOTP
};