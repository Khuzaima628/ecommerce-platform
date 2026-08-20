interface MailTransporter {
  sendMail: (options: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<unknown>;
}

interface SendOtpEmailInput {
  email: string;
  otp: string;
  fullName: string;
}

const transporter = require("../config/mailer") as MailTransporter;

const sendOtpEmail = async ({ email, otp, fullName }: SendOtpEmailInput): Promise<void> => {
  await transporter.sendMail({
    from: '"Auth App" <no-reply@authapp.com>',
    to: email,
    subject: "Verify your Email",
    html: `<p>Hello ${fullName},</p><p>Your verification code is <strong>${otp}</strong>.</p><p>This OTP is valid for 10 minutes.</p>`,
  });
};

export { sendOtpEmail };
