import nodemailer from 'nodemailer';
import { google } from 'googleapis';
const oAuthClient = new google.auth.OAuth2({
    clientId: "218833056555-jk0ls5nue6decqo5vvhacn1ikpffo31e.apps.googleusercontent.com",
    clientSecret: "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",
    redirectUri: "https://developers.google.com/oauthplayground"
});
oAuthClient.setCredentials({ refresh_token: "218833056555-jk0ls5nue6decqo5vvhacn1ikpffo31e.apps.googleusercontent.com" });
export const borahaeEmail = async (email, message, subject) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "borahaecafepos@gmail.com",
            clientId: "218833056555-jk0ls5nue6decqo5vvhacn1ikpffo31e.apps.googleusercontent.com",
            clientSecret: "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",
            refreshToken: "1//04vGQfFTNv8PJCgYIARAAGAQSNwF-L9Ir0jEEqUT0U_UVY7X6SxiOpFzCwDu-AVkOk17cN06nR8k3y8gu91xvEJ8z5Qcm9mZPNPU",
            accessToken: "ya29.a0AVvZVsrq227XcAgp-nzv68aFwV1NX78bnVA23SsqfCRkt4MSlkRCZXaxBviJ7Khk2rSIHUg-n5a4fUiO8MmMhLTP9ul-hkclDlzNf5F4mQqu71ZbtTUzJ9hcFnUKHvCpp6ms8llIowEzOpDePbZvBE9ZXkxAaCgYKAWISARMSFQGbdwaICYTuc4nO9ZqVkm8gbD7YXQ0163"
        }
    });
    await transporter.sendMail({
        from: "borahaecafepos@gmail.com",
        to: email,
        subject: subject,
        html: message
    });
};
