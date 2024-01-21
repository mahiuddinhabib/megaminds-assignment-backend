import { z } from 'zod';

const loginZodSchema = z.object({
  body: z.object({
    phoneNumber: z.string({
      required_error: 'Phone number is required',
    }),
  }),
});

const verifyOtpZodSchema = z.object({
  body: z.object({
    phoneNumber: z.string({
      required_error: 'Phone number is required',
    }),
    otp: z.string({
      required_error: 'OTP is required',
    }),
  }),
});

export const AuthValidation = {
  loginZodSchema,
  verifyOtpZodSchema,
};
