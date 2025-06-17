import { Response } from "express";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge?: number;
  expires?: Date;
  path?: string;
}

export const setCookie = (
  res: Response,
  name: string,
  value: string | undefined,
  options: Partial<CookieOptions> = {}
) => {
  const defaultOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    maxAge: 90 * 24 * 60 * 60 * 1000,
    path: "/",
  };

  res.cookie(name, value, {
    ...defaultOptions,
    ...options,
  });
};

export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};
