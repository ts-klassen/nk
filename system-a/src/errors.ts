import type { ErrorRequestHandler } from "express";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string
  ) {
    super(message);
  }
}

export function isDuplicateEntry(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "errno" in error &&
    Number((error as { errno: unknown }).errno) === 1062
  );
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: string }).type === "entity.parse.failed"
  ) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "入力値が不正です"
      }
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "サーバーエラーが発生しました"
    }
  });
};
