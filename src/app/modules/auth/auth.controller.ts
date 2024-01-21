import { Request, Response } from 'express';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IVerifiedOTPResponse } from './auth.interface';
import { AuthService } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUser(loginData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully!',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;
  const result = await AuthService.verifyOtp(phoneNumber, otp);

  const { refreshToken, ...data } = result;

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IVerifiedOTPResponse>(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: data,
  });
});

export const AuthController = {
  loginUser,
  verifyOtp,
};
