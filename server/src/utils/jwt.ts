import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
  sessionSecret: string;
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${config.accessTokenTtlMinutes}m`,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${config.refreshTokenTtlDays}d`,
  });
}

export function verifyToken<T>(token: string) {
  return jwt.verify(token, config.jwtSecret) as T;
}
