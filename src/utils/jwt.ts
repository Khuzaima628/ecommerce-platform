import crypto from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "3h";
const REFRESH_TOKEN_EXPIRES_IN = "15d";

const getSecret = (
  name: "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET",
): string => {
  const secret = process.env[name];
  if (!secret) throw new Error(`${name} is not set`);
  return secret;
};

const loginAccessToken = (payload: object): string =>
  jwt.sign(payload, getSecret("ACCESS_TOKEN_SECRET"), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const loginRefreshToken = (payload: object): string =>
  jwt.sign(payload, getSecret("REFRESH_TOKEN_SECRET"), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    jwtid: crypto.randomUUID(),
  });

const verifyAccessToken = (token: string): string | JwtPayload =>
  jwt.verify(token, getSecret("ACCESS_TOKEN_SECRET"));

const verifyRefreshToken = (token: string): string | JwtPayload =>
  jwt.verify(token, getSecret("REFRESH_TOKEN_SECRET"));

export {
  loginAccessToken,
  loginRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
