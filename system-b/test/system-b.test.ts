import fs from "node:fs/promises";
import net from "node:net";
import { spawn, type ChildProcess } from "node:child_process";
import mysql, {
  type Connection,
  type ConnectionOptions,
  type RowDataPacket
} from "mysql2/promise";
import { expect } from "chai";
import argon2 from "argon2";

const baseUrl = `http://127.0.0.1:${process.env.SYSTEM_B_PORT ?? "3001"}`;
let serverProcess: ChildProcess | undefined;

type JsonBody = any;

interface TestResponse<TBody = JsonBody> {
  status: number;
  headers: Headers;
  body: TBody;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface TestUser {
  username: string;
  password: string;
}

interface PasswordHashRow extends RowDataPacket {
  password_hash: string;
}

function requiredEnv(name: string, hint: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }

  throw new Error(`${name} is required. ${hint}`);
}

const database = requiredEnv(
  "MYSQL_DATABASE",
  "Set MYSQL_DATABASE when running tests."
);

function assertVolatileDatabaseName(databaseName: string): void {
  if (/^[A-Za-z0-9_]+_volatile$/.test(databaseName)) {
    return;
  }

  throw new Error(
    `Refusing to reset non-volatile database: ${JSON.stringify(databaseName)}. ` +
      "MYSQL_DATABASE for tests must end with _volatile."
  );
}

assertVolatileDatabaseName(database);

const mysqlConnectionConfig = {
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER ?? "root",
  password: requiredEnv("MYSQL_PASSWORD", "Source .env before running tests.")
} satisfies ConnectionOptions;

function auth(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

async function resetDatabase(): Promise<void> {
  const schemaSql = await fs.readFile("system-b/sql/schema.sql", "utf8");
  const connectionConfig = {
    ...mysqlConnectionConfig,
    multipleStatements: true
  } satisfies ConnectionOptions;
  let connection: Connection | undefined;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      connection = await mysql.createConnection(connectionConfig);
      break;
    } catch (error) {
      if (attempt === 30) {
        throw error;
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!connection) {
    throw new Error("Could not connect to MySQL.");
  }

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await connection.query(
      `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
    );
    await connection.query(`USE \`${database}\``);
    await connection.query(schemaSql);
  } finally {
    await connection.end();
  }
}

async function findPasswordHash(username: string): Promise<string | undefined> {
  const connection = await mysql.createConnection({
    ...mysqlConnectionConfig,
    database
  });

  try {
    const [rows] = await connection.execute<PasswordHashRow[]>(
      "SELECT password_hash FROM users WHERE username = ?",
      [username]
    );
    return rows[0]?.password_hash;
  } finally {
    await connection.end();
  }
}

function waitForPort(port: number, timeoutMs = 5000): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`server did not listen on port ${port}`));
          return;
        }
        setTimeout(tryConnect, 100);
      });
    };

    tryConnect();
  });
}

async function request(
  path: string,
  options: RequestOptions = {}
): Promise<TestResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers ?? {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  return {
    status: response.status,
    headers: response.headers,
    body
  };
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<TestResponse> {
  return request(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
}

async function patchJson(
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<TestResponse> {
  return request(path, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body)
  });
}

let sequence = 0;

function uniqueValue(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

function expectUnauthorized(response: TestResponse): void {
  expect(response.status).to.equal(401);
  expect(response.headers.get("www-authenticate")).to.equal(
    'Basic realm="backend-training"'
  );
  expect(response.body).to.deep.equal({
    error: {
      code: "UNAUTHORIZED",
      message: "認証が必要です"
    }
  });
}

async function createUser(prefix = "user"): Promise<TestUser> {
  const user = {
    username: uniqueValue(prefix),
    password: "password123"
  };
  const response = await postJson("/users", user);

  expect(response.status).to.equal(201);
  expect(response.body).to.include({ username: user.username });

  return user;
}

async function createTerm(prefix = "用語"): Promise<TestResponse> {
  const termText = uniqueValue(prefix);
  const response = await postJson("/terms", { term: termText });

  expect(response.status).to.equal(201);
  expect(response.body).to.include({ term: termText });

  return response;
}

async function createExample(
  termId: number,
  user: TestUser,
  overrides: Record<string, unknown> = {}
): Promise<TestResponse> {
  const requestBody = {
    body: uniqueValue("用例本文"),
    collectedDate: "2026-04-28",
    ...overrides
  };
  const response = await postJson(`/terms/${termId}/examples`, requestBody, {
    authorization: auth(user.username, user.password)
  });

  expect(response.status).to.equal(201);

  return response;
}

describe("用例採集 API", () => {
  before(async () => {
    await resetDatabase();

    const spawnedServer = spawn("node", ["system-b/dist/server.js"], {
      env: {
        ...process.env,
        PORT: process.env.SYSTEM_B_PORT ?? "3001",
        MYSQL_DATABASE: database
      },
      stdio: ["ignore", "pipe", "pipe"]
    });
    serverProcess = spawnedServer;

    spawnedServer.stdout?.on("data", (chunk) => process.stdout.write(chunk));
    spawnedServer.stderr?.on("data", (chunk) => process.stderr.write(chunk));

    await waitForPort(Number(process.env.SYSTEM_B_PORT ?? "3001"));
  });

  after(() => {
    serverProcess?.kill();
  });

  describe("ユーザー登録と Basic 認証", () => {
    it("ユーザーを登録できる", async () => {
      const username = uniqueValue("alice");
      const password = "password123";
      const response = await postJson("/users", {
        username,
        password
      });

      expect(response.status).to.equal(201);
      expect(response.body).to.include({ username });
      expect(response.body).to.have.property("id").that.is.a("number");
      expect(response.body).to.have.property("createdAt").that.matches(/\+09:00$/);
      expect(response.body).to.not.have.property("password");
      expect(response.body).to.not.have.property("passwordHash");

      const passwordHash = await findPasswordHash(username);
      expect(passwordHash).to.be.a("string");
      if (!passwordHash) {
        throw new Error(`Password hash was not found for ${username}.`);
      }
      expect(passwordHash).to.not.equal(password);
      expect(passwordHash).to.match(/^\$argon2/);
      expect(await argon2.verify(passwordHash, password)).to.equal(true);
    });

    it("username が重複したら 409 を返す", async () => {
      const username = uniqueValue("duplicate_user");
      const created = await postJson("/users", {
        username,
        password: "password123"
      });
      expect(created.status).to.equal(201);

      const response = await postJson("/users", {
        username,
        password: "password123"
      });

      expect(response.status).to.equal(409);
      expect(response.body).to.deep.equal({
        error: {
          code: "CONFLICT",
          message: "リソースが競合しています"
        }
      });
    });

    it("認証なしで用例を作ろうとすると 401 と WWW-Authenticate を返す", async () => {
      const term = await createTerm("認証なし作成");
      const response = await postJson(`/terms/${term.body.id}/examples`, {
        body: "PUT は冪等な操作として設計することが多い。",
        collectedDate: "2026-04-28",
        note: "API設計レビュー"
      });

      expectUnauthorized(response);
    });

    it("不正な Basic 認証は 401 と WWW-Authenticate を返す", async () => {
      const user = await createUser("invalid_auth_user");
      const term = await createTerm("認証失敗");

      const response = await postJson(
        `/terms/${term.body.id}/examples`,
        {
          body: "不正な認証では用例を作成できない。",
          collectedDate: "2026-04-28"
        },
        { authorization: auth(user.username, "wrongpassword") }
      );

      expectUnauthorized(response);
    });
  });

  describe("用語 CRUD", () => {
    it("ログインなしで用語を作成できる", async () => {
      const term = uniqueValue("排他制御");
      const response = await postJson("/terms", { term });

      expect(response.status).to.equal(201);
      expect(response.body).to.include({ term });
      expect(response.body).to.have.property("id").that.is.a("number");
      expect(response.body).to.have.property("createdAt").that.matches(/\+09:00$/);
    });

    it("term が重複したら 409 を返す", async () => {
      const term = uniqueValue("重複用語");
      const created = await postJson("/terms", { term });
      expect(created.status).to.equal(201);

      const response = await postJson("/terms", { term });

      expect(response.status).to.equal(409);
      expect(response.body.error.code).to.equal("CONFLICT");
    });

    it("用語一覧は limit, offset, total を返す", async () => {
      await createTerm("一覧用語");
      const response = await request("/terms?limit=1&offset=0");

      expect(response.status).to.equal(200);
      expect(response.body.items).to.have.lengthOf(1);
      expect(response.body.pagination).to.include({ limit: 1, offset: 0 });
      expect(response.body.pagination.total).to.be.at.least(1);
    });

    it("用語を取得・更新・削除できる", async () => {
      const created = await createTerm("削除テスト");
      const termId = created.body.id;

      const found = await request(`/terms/${termId}`);
      expect(found.status).to.equal(200);
      expect(found.body.term).to.equal(created.body.term);

      const updatedTerm = uniqueValue("更新後の用語");
      const patched = await patchJson(`/terms/${termId}`, { term: updatedTerm });
      expect(patched.status).to.equal(204);

      const updated = await request(`/terms/${termId}`);
      expect(updated.body.term).to.equal(updatedTerm);

      const deleted = await request(`/terms/${termId}`, { method: "DELETE" });
      expect(deleted.status).to.equal(204);

      const notFound = await request(`/terms/${termId}`);
      expect(notFound.status).to.equal(404);
      expect(notFound.body.error.code).to.equal("NOT_FOUND");
    });

    it("PATCH で term が重複したら 409 を返す", async () => {
      const original = await createTerm("重複元");
      const target = await createTerm("重複更新先");

      const response = await patchJson(`/terms/${target.body.id}`, {
        term: original.body.term
      });

      expect(response.status).to.equal(409);
      expect(response.body).to.deep.equal({
        error: {
          code: "CONFLICT",
          message: "リソースが競合しています"
        }
      });
    });
  });

  describe("用例 CRUD", () => {
    it("認証済みユーザーは用例を作成できる", async () => {
      const user = await createUser("example_creator");
      const term = await createTerm("結果整合性");

      const response = await postJson(
        `/terms/${term.body.id}/examples`,
        {
          body: "検索結果は少し遅れて結果整合性を満たす。",
          collectedDate: "2026-04-28",
          note: "障害対応の会話"
        },
        { authorization: auth(user.username, user.password) }
      );

      expect(response.status).to.equal(201);
      expect(response.body).to.include({
        termId: term.body.id,
        body: "検索結果は少し遅れて結果整合性を満たす。",
        collectedDate: "2026-04-28",
        note: "障害対応の会話"
      });
      expect(response.body).to.have.property("userId").that.is.a("number");
    });

    it("ログインなしで用語に紐付く用例を一覧取得できる", async () => {
      const user = await createUser("example_list_user");
      const term = await createTerm("可観測性");
      await createExample(term.body.id, user, {
        body: "可観測性を高めるためにメトリクスを追加する。1"
      });
      await createExample(term.body.id, user, {
        body: "可観測性を高めるためにメトリクスを追加する。2"
      });

      const response = await request(`/terms/${term.body.id}/examples?limit=1&offset=1`);

      expect(response.status).to.equal(200);
      expect(response.body.items).to.have.lengthOf(1);
      expect(response.body.pagination).to.deep.equal({
        limit: 1,
        offset: 1,
        total: 2
      });
      expect(response.body.items[0].body).to.equal(
        "可観測性を高めるためにメトリクスを追加する。2"
      );
    });

    it("ログインなしで用例詳細を取得できる", async () => {
      const user = await createUser("example_detail_user");
      const term = await createTerm("冪等キー");
      const example = await createExample(term.body.id, user, {
        body: "冪等キーを指定して二重登録を防ぐ。"
      });

      const response = await request(`/examples/${example.body.id}`);

      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(example.body.id);
      expect(response.body.body).to.equal("冪等キーを指定して二重登録を防ぐ。");
    });

    it("所有者は用例を更新・削除できる", async () => {
      const user = await createUser("example_owner");
      const term = await createTerm("所有者更新");
      const example = await createExample(term.body.id, user, {
        body: "更新前"
      });

      const patched = await patchJson(
        `/examples/${example.body.id}`,
        {
          body: "更新後",
          collectedDate: "2026-04-29",
          note: "更新後の備考"
        },
        { authorization: auth(user.username, user.password) }
      );
      expect(patched.status).to.equal(204);

      const updated = await request(`/examples/${example.body.id}`);
      expect(updated.body.body).to.equal("更新後");
      expect(updated.body.collectedDate).to.equal("2026-04-29");
      expect(updated.body.note).to.equal("更新後の備考");

      const deleted = await request(`/examples/${example.body.id}`, {
        method: "DELETE",
        headers: { authorization: auth(user.username, user.password) }
      });
      expect(deleted.status).to.equal(204);
    });

    it("認証なしで用例を更新・削除しようとすると 401 と WWW-Authenticate を返す", async () => {
      const user = await createUser("example_unauth_user");
      const term = await createTerm("未認証更新削除");
      const example = await createExample(term.body.id, user, {
        body: "認証なしでは更新も削除もできない。"
      });

      const patched = await patchJson(`/examples/${example.body.id}`, {
        body: "未認証更新"
      });
      expectUnauthorized(patched);

      const deleted = await request(`/examples/${example.body.id}`, {
        method: "DELETE"
      });
      expectUnauthorized(deleted);
    });

    it("他ユーザーの用例は更新・削除できない", async () => {
      const owner = await createUser("example_forbidden_owner");
      const other = await createUser("example_forbidden_other");
      const term = await createTerm("所有者制御");
      const example = await createExample(term.body.id, owner, {
        body: "所有者だけが編集できる。"
      });

      const patched = await patchJson(
        `/examples/${example.body.id}`,
        { body: "別ユーザーによる更新" },
        { authorization: auth(other.username, other.password) }
      );
      expect(patched.status).to.equal(403);
      expect(patched.body.error.code).to.equal("FORBIDDEN");

      const deleted = await request(`/examples/${example.body.id}`, {
        method: "DELETE",
        headers: { authorization: auth(other.username, other.password) }
      });
      expect(deleted.status).to.equal(403);
      expect(deleted.body.error.code).to.equal("FORBIDDEN");
    });

    it("用例が紐付いている用語は削除できない", async () => {
      const user = await createUser("example_conflict_user");
      const term = await createTerm("削除制約");
      await createExample(term.body.id, user, {
        body: "子データがあるので親は削除しない。"
      });

      const response = await request(`/terms/${term.body.id}`, { method: "DELETE" });

      expect(response.status).to.equal(409);
      expect(response.body.error.code).to.equal("CONFLICT");
    });
  });

  describe("入力エラー", () => {
    it("不正な入力は 400 と VALIDATION_ERROR を返す", async () => {
      const response = await postJson("/terms", { term: "" });

      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: {
          code: "VALIDATION_ERROR",
          message: "入力値が不正です"
        }
      });
    });

    it("不正なページングは 400 と VALIDATION_ERROR を返す", async () => {
      const response = await request("/terms?limit=101");

      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: {
          code: "VALIDATION_ERROR",
          message: "入力値が不正です"
        }
      });
    });
  });

  describe("存在しないリソース", () => {
    it("存在しないリソースは 404 を返す", async () => {
      const term = await request("/terms/999999");
      expect(term.status).to.equal(404);
      expect(term.body).to.deep.equal({
        error: {
          code: "NOT_FOUND",
          message: "対象リソースが存在しません"
        }
      });

      const example = await request("/examples/999999");
      expect(example.status).to.equal(404);
      expect(example.body.error.code).to.equal("NOT_FOUND");

      const examples = await request("/terms/999999/examples");
      expect(examples.status).to.equal(404);
      expect(examples.body.error.code).to.equal("NOT_FOUND");
    });

    it("存在しない用語に用例を作ろうとすると 404 を返す", async () => {
      const user = await createUser("not_found_user");

      const response = await postJson(
        "/terms/999999/examples",
        {
          body: "存在しない用語には紐付けられない。",
          collectedDate: "2026-04-28"
        },
        { authorization: auth(user.username, user.password) }
      );

      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({
        error: {
          code: "NOT_FOUND",
          message: "対象リソースが存在しません"
        }
      });
    });
  });
});
