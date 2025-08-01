import { NextFunction, Request, Response } from "express";
import * as AuthService from "../services/authService";
import { catchAsync } from "../utils/catchAsync";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  await AuthService.registerUser(name, email, password);
  res.status(201).json({ message: "User created. OTP sent to mail" });
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  await AuthService.verifyUserOTP(email, otp);
  res.status(200).json({ message: "Email verified" });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const token = await AuthService.loginUser(email, password);

  res.cookie("vizion", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 89 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Logged in successfully",
  });
});

export const resendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body;
      const result = await AuthService.resendOTPService(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("vizion", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  const result = AuthService.logoutUser;
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await AuthService.forgotPasswordService(email);
    res.status(200).json(result);
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword, token } = req.body;
    const result = AuthService.resetPasswordService(email, token, newPassword);
    res.status(200).json(result);
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await AuthService.updatePasswordService(
      userId,
      oldPassword,
      newPassword
    );
    res.status(200).json(result);
  }
);

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordResetToken, passwordResetTokenExpires, otp, otpExpires, otpSentAt, ...userWithoutSensitiveData } = req.user;
    
    res.status(200).json({
      success: true,
      user: userWithoutSensitiveData,
    });
  }
);
