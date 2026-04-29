import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket
} from "mysql2/promise";

let pool: Pool | undefined;

function requiredEnv(name: string, hint: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }

  throw new Error(`${name} is required. ${hint}`);
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? "3306"),
      user: process.env.MYSQL_USER ?? "root",
      password: requiredEnv(
        "MYSQL_PASSWORD",
        "Source .env before starting the server."
      ),
      database: requiredEnv(
        "MYSQL_DATABASE",
        "Set MYSQL_DATABASE when starting the server."
      ),
      timezone: "Z",
      dateStrings: true,
      connectionLimit: 10
    });
  }

  return pool;
}

async function withUtcConnection<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();

  try {
    await connection.query("SET time_zone = '+00:00'");
    return await callback(connection);
  } finally {
    connection.release();
  }
}

export async function queryRows<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  return withUtcConnection(async (connection) => {
    const [rows] = await connection.query<T>(sql, params);
    return rows;
  });
}

export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  return withUtcConnection(async (connection) => {
    const [result] = await connection.execute<ResultSetHeader>(
      sql,
      params as any
    );
    return result;
  });
}
