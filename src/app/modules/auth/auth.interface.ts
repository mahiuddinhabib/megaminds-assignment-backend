import { Model } from "mongoose";

export type ILoginUser = {
  phoneNumber: string;
  otp: string;
};

export type ILoginUserResponse = {
  phoneNumber: string;
  isVerified: boolean;
  expiresAt: Date;
  otp: string; // Remove this after SMS integration
};

export type IVerifiedOTPResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type IOtp = {
  phoneNumber: string;
  otp: string;
  isVerified: boolean;
  expiresAt: Date;
};

export type OtpModel = Model<IOtp, Record<string, unknown>>;

