import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET);

export const signRefreshToken = (payload, rememberMe = false) =>
  jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: rememberMe ? "30d" : "7d",
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET);

export const setRefreshCookie = (res, token, rememberMe = false) => {
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};

export const clearRefreshCookie = (res) =>
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });