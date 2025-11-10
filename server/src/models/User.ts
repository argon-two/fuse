import { db } from '../database/db';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  avatar_url?: string;
  status: string;
  created_at: Date;
  last_seen: Date;
}

export class UserModel {
  static async create(username: string, email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, avatar_url, status, created_at, last_seen',
      [username, email, passwordHash]
    );
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await db.query(
      'SELECT id, username, email, avatar_url, status, created_at, last_seen FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static async updateStatus(userId: number, status: string) {
    await db.query(
      'UPDATE users SET status = $1, last_seen = CURRENT_TIMESTAMP WHERE id = $2',
      [status, userId]
    );
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await db.query(
      'SELECT id, username, email, avatar_url, status, created_at, last_seen FROM users ORDER BY username'
    );
    return result.rows;
  }

  static async updateAvatar(userId: number, avatarUrl: string) {
    await db.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2',
      [avatarUrl, userId]
    );
  }
}
