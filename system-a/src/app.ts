import express, { type Request, type Response } from "express";
import { body } from "express-validator";
import { DateTime } from "luxon";
import type { RowDataPacket } from "mysql2/promise";
import argon2 from "argon2";
import { requireAuth } from "./auth";
import { execute, queryRows } from "./db";
import {
  AppError,
  errorHandler,
  isDuplicateEntry,
  isReferencedByForeignKey
} from "./errors";
import {
  getPagination,
  handleValidationErrors,
  requireAtLeastOne,
  validateId,
  validatePagination
} from "./validation";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

interface BookRow extends RowDataPacket {
  id: number;
  isbn: string;
  title: string;
  author: string;
  published_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ReadingNoteRow extends RowDataPacket {
  id: number;
  user_id: number;
  book_id: number;
  page: number;
  body: string;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

function formatDateTime(value: string): string {
  const dateTime = DateTime.fromSQL(value, { zone: "utc" });
  if (!dateTime.isValid) {
    throw new Error(`Invalid UTC datetime: ${value}`);
  }

  const formatted = dateTime
    .setZone("Asia/Tokyo")
    .toISO({ suppressMilliseconds: true });
  if (!formatted) {
    throw new Error(`Invalid UTC datetime: ${value}`);
  }

  return formatted;
}

function formatDate(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const date = DateTime.fromSQL(value, { zone: "utc" });
  if (!date.isValid) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date.toISODate();
}

function mapUser(row: UserRow) {
  return {
    id: Number(row.id),
    username: row.username,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at)
  };
}

function mapBook(row: BookRow) {
  return {
    id: Number(row.id),
    isbn: row.isbn,
    title: row.title,
    author: row.author,
    publishedDate: formatDate(row.published_date),
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at)
  };
}

function mapReadingNote(row: ReadingNoteRow) {
  return {
    id: Number(row.id),
    bookId: Number(row.book_id),
    page: Number(row.page),
    body: row.body,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at)
  };
}

async function findBook(bookId: number): Promise<BookRow> {
  const rows = await queryRows<BookRow[]>("SELECT * FROM books WHERE id = ?", [
    bookId
  ]);

  if (!rows[0]) {
    throw new AppError(404, "NOT_FOUND", "対象リソースが存在しません");
  }

  return rows[0];
}

async function findReadingNote(noteId: number): Promise<ReadingNoteRow> {
  const rows = await queryRows<ReadingNoteRow[]>(
    "SELECT * FROM reading_notes WHERE id = ?",
    [noteId]
  );

  if (!rows[0]) {
    throw new AppError(404, "NOT_FOUND", "対象リソースが存在しません");
  }

  return rows[0];
}

function assertOwnReadingNote(note: ReadingNoteRow, userId: number): void {
  if (Number(note.user_id) !== userId) {
    throw new AppError(403, "FORBIDDEN", "この操作は許可されていません");
  }
}

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1000 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function createApp() {
  const app = express();
  app.use(express.json());

  app.post(
    "/users",
    [
      body("username").isString().matches(/^[A-Za-z0-9_]{3,32}$/),
      body("password").isString().isLength({ min: 8, max: 72 }),
      handleValidationErrors
    ],
    async (req: Request, res: Response) => {
      const passwordHash = await argon2.hash(req.body.password);

      let userId: number;
      try {
        const result = await execute(
          "INSERT INTO users (username, password_hash) VALUES (?, ?)",
          [req.body.username, passwordHash]
        );
        userId = Number(result.insertId);
      } catch (error) {
        if (isDuplicateEntry(error)) {
          throw new AppError(409, "CONFLICT", "リソースが競合しています");
        }
        throw error;
      }

      const users = await queryRows<UserRow[]>(
        "SELECT id, username, created_at, updated_at FROM users WHERE id = ?",
        [userId]
      );

      res.status(201).json(mapUser(users[0]));
    }
  );

  app.get(
    "/books",
    validatePagination(),
    async (req: Request, res: Response) => {
      const { limit, offset } = getPagination(req);
      const countRows = await queryRows<CountRow[]>(
        "SELECT COUNT(*) AS total FROM books"
      );
      const books = await queryRows<BookRow[]>(
        "SELECT * FROM books ORDER BY id ASC LIMIT ? OFFSET ?",
        [limit, offset]
      );

      res.json({
        items: books.map(mapBook),
        pagination: {
          limit,
          offset,
          total: Number(countRows[0]?.total ?? 0)
        }
      });
    }
  );

  app.post(
    "/books",
    [
      body("isbn").isString().matches(/^(?:\d{10}|\d{13})$/),
      body("title").isString().trim().isLength({ min: 1, max: 255 }),
      body("author").isString().trim().isLength({ min: 1, max: 255 }),
      body("publishedDate")
        .optional({ nullable: true })
        .isString()
        .bail()
        .custom(isValidDateOnly),
      handleValidationErrors
    ],
    async (req: Request, res: Response) => {
      let bookId: number;
      try {
        const result = await execute(
          "INSERT INTO books (isbn, title, author, published_date) VALUES (?, ?, ?, ?)",
          [
            req.body.isbn,
            req.body.title,
            req.body.author,
            req.body.publishedDate ?? null
          ]
        );
        bookId = Number(result.insertId);
      } catch (error) {
        if (isDuplicateEntry(error)) {
          throw new AppError(409, "CONFLICT", "リソースが競合しています");
        }
        throw error;
      }

      const book = await findBook(bookId);
      res.status(201).json(mapBook(book));
    }
  );

  app.get(
    "/books/:bookId",
    validateId("bookId"),
    async (req: Request, res: Response) => {
      const book = await findBook(Number(req.params.bookId));
      res.json(mapBook(book));
    }
  );

  app.patch(
    "/books/:bookId",
    [
      ...validateId("bookId"),
      requireAtLeastOne(["isbn", "title", "author", "publishedDate"]),
      body("isbn").optional().isString().matches(/^(?:\d{10}|\d{13})$/),
      body("title").optional().isString().trim().isLength({ min: 1, max: 255 }),
      body("author").optional().isString().trim().isLength({ min: 1, max: 255 }),
      body("publishedDate")
        .optional({ nullable: true })
        .isString()
        .bail()
        .custom(isValidDateOnly),
      handleValidationErrors
    ],
    async (req: Request, res: Response) => {
      await findBook(Number(req.params.bookId));
      const assignments: string[] = [];
      const values: unknown[] = [];

      if (Object.prototype.hasOwnProperty.call(req.body, "isbn")) {
        assignments.push("isbn = ?");
        values.push(req.body.isbn);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
        assignments.push("title = ?");
        values.push(req.body.title);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "author")) {
        assignments.push("author = ?");
        values.push(req.body.author);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "publishedDate")) {
        assignments.push("published_date = ?");
        values.push(req.body.publishedDate);
      }

      try {
        await execute(
          `UPDATE books SET ${assignments.join(", ")} WHERE id = ?`,
          [...values, Number(req.params.bookId)]
        );
      } catch (error) {
        if (isDuplicateEntry(error)) {
          throw new AppError(409, "CONFLICT", "リソースが競合しています");
        }
        throw error;
      }

      res.status(204).send();
    }
  );

  app.delete(
    "/books/:bookId",
    validateId("bookId"),
    async (req: Request, res: Response) => {
      const bookId = Number(req.params.bookId);
      await findBook(bookId);

      try {
        await execute("DELETE FROM books WHERE id = ?", [bookId]);
      } catch (error) {
        if (isReferencedByForeignKey(error)) {
          throw new AppError(409, "CONFLICT", "リソースが競合しています");
        }
        throw error;
      }

      res.status(204).send();
    }
  );

  app.get(
    "/books/:bookId/reading-notes",
    [requireAuth, ...validateId("bookId"), ...validatePagination()],
    async (req: Request, res: Response) => {
      const bookId = Number(req.params.bookId);
      await findBook(bookId);

      const { limit, offset } = getPagination(req);
      const countRows = await queryRows<CountRow[]>(
        "SELECT COUNT(*) AS total FROM reading_notes WHERE book_id = ? AND user_id = ?",
        [bookId, req.user?.id]
      );
      const notes = await queryRows<ReadingNoteRow[]>(
        "SELECT * FROM reading_notes WHERE book_id = ? AND user_id = ? ORDER BY id ASC LIMIT ? OFFSET ?",
        [bookId, req.user?.id, limit, offset]
      );

      res.json({
        items: notes.map(mapReadingNote),
        pagination: {
          limit,
          offset,
          total: Number(countRows[0]?.total ?? 0)
        }
      });
    }
  );

  app.post(
    "/books/:bookId/reading-notes",
    [
      requireAuth,
      ...validateId("bookId"),
      body("page").isInt({ min: 1 }).toInt(),
      body("body").isString().trim().isLength({ min: 1, max: 2000 }),
      handleValidationErrors
    ],
    async (req: Request, res: Response) => {
      const bookId = Number(req.params.bookId);
      await findBook(bookId);

      const result = await execute(
        "INSERT INTO reading_notes (user_id, book_id, page, body) VALUES (?, ?, ?, ?)",
        [req.user?.id, bookId, req.body.page, req.body.body]
      );

      const note = await findReadingNote(Number(result.insertId));
      res.status(201).json(mapReadingNote(note));
    }
  );

  app.get(
    "/reading-notes/:noteId",
    [requireAuth, ...validateId("noteId")],
    async (req: Request, res: Response) => {
      const note = await findReadingNote(Number(req.params.noteId));
      assertOwnReadingNote(note, Number(req.user?.id));
      res.json(mapReadingNote(note));
    }
  );

  app.patch(
    "/reading-notes/:noteId",
    [
      requireAuth,
      ...validateId("noteId"),
      requireAtLeastOne(["page", "body"]),
      body("page").optional().isInt({ min: 1 }).toInt(),
      body("body").optional().isString().trim().isLength({ min: 1, max: 2000 }),
      handleValidationErrors
    ],
    async (req: Request, res: Response) => {
      const note = await findReadingNote(Number(req.params.noteId));
      assertOwnReadingNote(note, Number(req.user?.id));

      const assignments: string[] = [];
      const values: unknown[] = [];

      if (Object.prototype.hasOwnProperty.call(req.body, "page")) {
        assignments.push("page = ?");
        values.push(req.body.page);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "body")) {
        assignments.push("body = ?");
        values.push(req.body.body);
      }

      await execute(
        `UPDATE reading_notes SET ${assignments.join(", ")} WHERE id = ?`,
        [...values, Number(req.params.noteId)]
      );

      res.status(204).send();
    }
  );

  app.delete(
    "/reading-notes/:noteId",
    [requireAuth, ...validateId("noteId")],
    async (req: Request, res: Response) => {
      const note = await findReadingNote(Number(req.params.noteId));
      assertOwnReadingNote(note, Number(req.user?.id));

      await execute("DELETE FROM reading_notes WHERE id = ?", [
        Number(req.params.noteId)
      ]);
      res.status(204).send();
    }
  );

  app.use((_req, _res, next) => {
    next(new AppError(404, "NOT_FOUND", "対象リソースが存在しません"));
  });
  app.use(errorHandler);

  return app;
}
