import pool from "../config/db";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  refreshToken: string | null;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

export const createUser = async (
  name: string,
  email: string,
  hashedPassword: string
): Promise<User> => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword]
  );
  return result.rows[0];
};

export const updateUserRefreshToken = async (
  userId: number,
  refreshToken: string | null
): Promise<void> => {
  const query = `
    UPDATE users
    SET refreshToken = $1
    WHERE id = $2
  `;

  await pool.query(query, [refreshToken, userId]);
};
