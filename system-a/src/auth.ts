import type { NextFunction, Request, RequestHandler, Response } from "express";
import argon2 from "argon2";
import type { RowDataPacket } from "mysql2/promise";
import { queryRows } from "./db";
import { AppError } from "./errors";
import type { AuthenticatedUser } from "./types";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
}

function unauthorized(res: Response): void {
  res.set("WWW-Authenticate", 'Basic realm="backend-training"');
  throw new AppError(401, "UNAUTHORIZED", "認証が必要です");
}

function parseBasicAuth(header: string | undefined): {
  username: string;
  password: string;
} | null {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  const encoded = header.slice("Basic ".length);
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1)
  };
}

export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const credentials = parseBasicAuth(req.header("Authorization"));
    if (!credentials) {
      unauthorized(res);
      return;
    }

    const users = await queryRows<UserRow[]>(
      "SELECT id, username, password_hash FROM users WHERE username = ?",
      [credentials.username]
    );

    const user = users[0];
    if (!user) {
      unauthorized(res);
      return;
    }

    const verified = await argon2.verify(user.password_hash, credentials.password);
    if (!verified) {
      unauthorized(res);
      return;
    }

    req.user = {
      id: Number(user.id),
      username: user.username
    } satisfies AuthenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
};
