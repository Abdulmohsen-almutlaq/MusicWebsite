const { Resend } = require('resend');

const sendVerificationEmail = async (email, token) => {
  // Point to the Frontend Verify Page
  // Use FRONTEND_URL if available, otherwise fallback to API_URL or a default
  const baseUrl = process.env.FRONTEND_URL || process.env.API_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl}/verify?token=${token}`;
  const apiKey = process.env.SMTP_PASS; // We stored the Resend Key here in the previous steps

  // Check if we have a Resend API Key (starts with 're_')
  const hasResendKey = apiKey && apiKey.startsWith('re_');

  if (hasResendKey) {
    try {
      const resend = new Resend(apiKey);

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Ar7bo to 6rabyat! Verify your email',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">AR7B 6rabyat is with you </h1>
              </div>
              
              <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thanks for signing up for 6rabyat! We're excited to have you on board. 
                Please verify your email address to get full access to all the music.
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationLink}" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                  Verify Account
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                If the button above doesn't work, copy and paste this link into your browser:
                <br>
                <a href="${verificationLink}" style="color: #0066cc; word-break: break-all;">${verificationLink}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #aaa; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} 6rabyat. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw new Error(error.message);
      }

      console.log(`Verification email sent to ${email} via Resend. ID: ${data.id}`);
    } catch (error) {
      console.error('Email Sending Failed (Falling back to console log):', error.message);
      logToConsole(verificationLink);
    }
  } else {
    console.log('No Resend API Key found (starts with re_).');
    logToConsole(verificationLink);
  }
};

const logToConsole = (link) => {
  console.log('---------------------------------------------------');
  console.log('Local Testing Mode.');
  console.log(`Verify your account by clicking this link:\n${link}`);
  console.log('---------------------------------------------------');
};

module.exports = { sendVerificationEmail };
