import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const [, , schemaPathArg, databaseArg] = process.argv;

if (!schemaPathArg || !databaseArg) {
  console.error("Usage: node scripts/reset-db.mjs <schema.sql> <database>");
  process.exit(1);
}

const schemaPath = path.resolve(process.cwd(), schemaPathArg);
const database = databaseArg;
const schemaSql = await fs.readFile(schemaPath, "utf8");

const connectionConfig = {
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "rootpass",
  multipleStatements: true
};

async function createConnectionWithRetry(maxAttempts = 30) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await mysql.createConnection(connectionConfig);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError;
}

const connection = await createConnectionWithRetry();

try {
  await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
  await connection.query(
    `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
  );
  await connection.query(`USE \`${database}\``);
  await connection.query(schemaSql);
  console.log(`Reset database: ${database}`);
} finally {
  await connection.end();
}
