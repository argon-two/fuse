import { db } from '../database/db';

export interface Message {
  id: number;
  channel_id: number;
  user_id: number;
  content?: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: Date;
  edited_at?: Date;
  deleted_at?: Date;
  username?: string;
  avatar_url?: string;
}

export class MessageModel {
  static async create(
    channelId: number,
    userId: number,
    content: string,
    messageType: string = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ): Promise<Message> {
    const result = await db.query(
      `INSERT INTO messages (channel_id, user_id, content, message_type, file_url, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [channelId, userId, content, messageType, fileUrl, fileName, fileSize]
    );
    return result.rows[0];
  }

  static async getChannelMessages(channelId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const result = await db.query(
      `SELECT m.*, u.username, u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.channel_id = $1 AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [channelId, limit, offset]
    );
    return result.rows.reverse();
  }

  static async update(messageId: number, userId: number, content: string): Promise<Message | null> {
    const result = await db.query(
      `UPDATE messages
       SET content = $1, edited_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [content, messageId, userId]
    );
    return result.rows[0] || null;
  }

  static async delete(messageId: number, userId: number): Promise<boolean> {
    const result = await db.query(
      `UPDATE messages
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [messageId, userId]
    );
    return result.rowCount > 0;
  }
}
