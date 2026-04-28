import mysql, {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket
} from "mysql2/promise";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? "3306"),
      user: process.env.MYSQL_USER ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "rootpass",
      database: process.env.MYSQL_DATABASE ?? "backend_training_a",
      timezone: "+09:00",
      dateStrings: true,
      connectionLimit: 10
    });
  }

  return pool;
}

export async function queryRows<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [rows] = await getPool().query<T>(sql, params);
  return rows;
}

export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params as any);
  return result;
}
