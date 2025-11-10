import { db } from '../database/db';

export interface Channel {
  id: number;
  name: string;
  type: string;
  created_by: number;
  created_at: Date;
}

export class ChannelModel {
  static async create(name: string, type: string, createdBy: number): Promise<Channel> {
    const result = await db.query(
      'INSERT INTO channels (name, type, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, type, createdBy]
    );
    return result.rows[0];
  }

  static async getAll(): Promise<Channel[]> {
    const result = await db.query(
      'SELECT * FROM channels ORDER BY created_at'
    );
    return result.rows;
  }

  static async getById(id: number): Promise<Channel | null> {
    const result = await db.query(
      'SELECT * FROM channels WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM channels WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}
