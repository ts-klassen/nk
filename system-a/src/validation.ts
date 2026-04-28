import type { Request, RequestHandler } from "express";
import { param, query, validationResult } from "express-validator";
import { AppError } from "./errors";

export const handleValidationErrors: RequestHandler = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new AppError(400, "VALIDATION_ERROR", "入力値が不正です"));
    return;
  }

  next();
};

export function validateId(name: string): RequestHandler[] {
  return [
    param(name).isInt({ min: 1 }).toInt(),
    handleValidationErrors
  ];
}

export function validatePagination(): RequestHandler[] {
  return [
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
    handleValidationErrors
  ];
}

export function getPagination(req: Request): { limit: number; offset: number } {
  return {
    limit: Number(req.query.limit ?? 20),
    offset: Number(req.query.offset ?? 0)
  };
}

export function requireAtLeastOne(fields: string[]): RequestHandler {
  return (req, _res, next) => {
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      next(new AppError(400, "VALIDATION_ERROR", "入力値が不正です"));
      return;
    }

    const hasField = fields.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (!hasField) {
      next(new AppError(400, "VALIDATION_ERROR", "入力値が不正です"));
      return;
    }

    next();
  };
}
