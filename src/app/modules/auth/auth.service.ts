import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { ILoginUser, ILoginUserResponse, IVerifiedOTPResponse } from "./auth.interface";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
// import { IUser } from "../user/user.interface";
import { isUserExist } from "../../../utils/isUserExists";
import { generateOTP } from "../../../utils/generateOTP";
import { Otp } from "./auth.model";

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { phoneNumber } = payload;

  const user = await isUserExist(phoneNumber, User);

  if (!user) {
    User.create({ phoneNumber });
  }

  const otpData = await Otp.findOne({ phoneNumber });

  if (otpData) {
    if (otpData.isVerified) {
      throw new ApiError(httpStatus.BAD_REQUEST, "OTP already verified. Request after 3 minutes");
    }

    const currentTime = new Date();
    // Convert remaining time into seconds
    const remainingSeconds = Math.ceil(
      (Number(otpData.expiresAt) - Number(currentTime)) / 1000
    );

    if (remainingSeconds > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `OTP already sent. Please try again after ${remainingSeconds} seconds`
      );
    } else {
      await Otp.deleteOne({ phoneNumber });
    }
  }

  const generatedOTP = generateOTP();

  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + 60 * 1000); // 1 minute

  const result = await Otp.create({
    phoneNumber,
    otp: generatedOTP,
    expiresAt,
  });

  // Send OTP to phone number
  // if (result) {
  //   await sendSMS({
  //     to: phoneNumber,
  //     message: `Your OTP is ${result.otp}. Please do not share it with anyone. OTP will expire in 1 minute`,
  //   });
  // }

  return {
    phoneNumber: result.phoneNumber,
    isVerified: result.isVerified,
    expiresAt: result.expiresAt,
    otp: result.otp, // Remove this after SMS integration
  };
};

const verifyOtp = async (phoneNumber: string, otp: string): Promise<IVerifiedOTPResponse> => {
  const otpData = await Otp.findOne({ phoneNumber });
  if (!otpData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP not found');
  }

  if(otpData.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP already verified');
  }

  const currentTime = new Date();
  // Check if otp is expired
  if (currentTime > otpData.expiresAt) {
    // Delete otp
    await Otp.deleteOne({ phoneNumber });
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
  }

  if (otpData.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP is incorrect');
  }

  // Update otp status
  const updatedOtpData = await Otp.findOneAndUpdate(
    { phoneNumber },
    { isVerified: true },
    { new: true }
  );

  if (!updatedOtpData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not verify otp');
  }



  const accessToken = jwtHelpers.createToken(
    { phoneNumber },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { phoneNumber },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  loginUser,
  verifyOtp,
};
