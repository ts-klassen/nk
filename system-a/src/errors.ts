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

function mysqlErrno(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("errno" in error)) {
    return undefined;
  }

  return Number((error as { errno: unknown }).errno);
}

export function isDuplicateEntry(error: unknown): boolean {
  return mysqlErrno(error) === 1062;
}

export function isReferencedByForeignKey(error: unknown): boolean {
  return mysqlErrno(error) === 1451;
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
