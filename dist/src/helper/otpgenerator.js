export default function generateOTP(length) {
    var digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * length)];
    }
    return otp;
}
