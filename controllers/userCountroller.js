import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/email.js";
import twilo from "twilio";

const client = twilo(process.env.TWILO_SID, process.env.TWILO_AUTH_TOKEN);

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password, phone, verificationMethod } = req.body;

    if (!name || !email || !password || !phone || !verificationMethod) {
      return next(new ErrorHandler("All Fields Are Required", 400));
    }

    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+234\d{10}$/;
      return phoneRegex.test(phone);
    }

    const existingUser = await User.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("User Already Exists", 400));
    }

    const registrationAttemptbyUser = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    });

    if (registrationAttemptbyUser.length > 3) {
      return next(
        new ErrorHandler(
          "Too Many Registration Attempts, try again after one hour",
          400
        )
      );
    }

    const userData = {
      name,
      email,
      phone,
      password,
    };

    const user = await User.create(userData);
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Assuming verificationCode is a function that handles verification
    sendVerificationCode(verificationMethod, verificationCode, email, phone);

    res.status(200).json({
      success: true,
      message: "User registered successfully. Verification code sent.",
      user,
    });
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  email,
  phone
) {
  if (verificationMethod === "email") {
    const message = generateEmailTemplate(verificationCode);
    sendEmail({
      email,
      subject: "Your Verification Email",
      message,
    });
  } else if (verificationMethod === "phone") {
    const verificationWithSpace = verificationCode
      .toString()
      .split("")
      .join("");
    await client.calls.create({
      twiml: `<response><say>Your Verification code is ${verificationWithSpace}. Your verification code is ${verificationWithSpace} </say></response>`,
      from: process.env.TWILO_PHONE_NUMBER,
      to: phone,
    });
  } else {
    throw new ErrorHandler("Invalid verification method", 500);
  }
  function generateEmailTemplate(verificationCode) {
    return `<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <!-- Main Container -->
  <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5">
    <tr>
      <td align="center" style="padding:40px 0;">
        <!-- Email Card -->
        <table width="100%" max-width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td bgcolor="#4f46e5" style="padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">Verify Your Email</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">
                Please use the following verification code:
              </p>
              
              <!-- Verification Code Box -->
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:15px;background:#f8f9fa;border-radius:6px;font-size:32px;font-weight:bold;letter-spacing:3px;color:#2d3748;">
                    ${verificationCode}
                  </td>
                </tr>
              </table>
              
              <p style="margin:20px 0 0 0;font-size:14px;color:#666666;">
                This code will expire in 15 minutes.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px;text-align:center;font-size:12px;color:#999999;border-top:1px solid #eeeeee;">
              © ${new Date().getFullYear()} Your Company. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
`;
  }
}
