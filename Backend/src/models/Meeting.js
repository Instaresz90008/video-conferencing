// const db = require('../config/database');
// const bcrypt = require('bcrypt');

// class Meeting {
//   static async create(meetingData) {
//     const { id, name, hostId, hostName, isPublic, password, maxParticipants, expiresAt } = meetingData;
    
//     let passwordHash = null;
//     if (password) {
//       passwordHash = await bcrypt.hash(password, 10);
//     }

//     const result = await db.query(
//       `INSERT INTO meetings (id, name, host_id, host_name, is_public, password_hash, max_participants, expires_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//        RETURNING *`,
//       [id, name, hostId, hostName, isPublic, passwordHash, maxParticipants || 50, expiresAt]
//     );
    
//     return result.rows[0];
//   }

//   static async findById(id) {
//     const result = await db.query(
//       `SELECT id, name, host_id, host_name, is_public, max_participants, created_at, expires_at, is_active
//        FROM meetings WHERE id = $1`,
//       [id]
//     );
//     return result.rows[0];
//   }

//   static async addParticipant(meetingId, participantId, participantName) {
//     await db.query(
//       `INSERT INTO meeting_participants (meeting_id, participant_id, participant_name)
//        VALUES ($1, $2, $3)`,
//       [meetingId, participantId, participantName]
//     );
//   }

//   static async getParticipantCount(meetingId) {
//     const result = await db.query(
//       'SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = $1 AND is_active = true',
//       [meetingId]
//     );
//     return parseInt(result.rows[0].count);
//   }

//   static async getParticipants(meetingId) {
//     const result = await db.query(
//       `SELECT participant_id, participant_name, joined_at, is_active
//        FROM meeting_participants 
//        WHERE meeting_id = $1 AND is_active = true
//        ORDER BY joined_at ASC`,
//       [meetingId]
//     );
//     return result.rows;
//   }

//   static async removeParticipant(meetingId, participantId) {
//     await db.query(
//       `UPDATE meeting_participants 
//        SET is_active = false, left_at = CURRENT_TIMESTAMP
//        WHERE meeting_id = $1 AND participant_id = $2`,
//       [meetingId, participantId]
//     );
//   }

//   static async endMeeting(meetingId) {
//     await db.query('UPDATE meetings SET is_active = false WHERE id = $1', [meetingId]);
//     await db.query(
//       'UPDATE meeting_participants SET is_active = false, left_at = CURRENT_TIMESTAMP WHERE meeting_id = $1',
//       [meetingId]
//     );
//   }

//   static async verifyPassword(plainPassword, hashedPassword) {
//     return bcrypt.compare(plainPassword, hashedPassword);
//   }
// }

// module.exports = Meeting;



































const db = require('../config/database');
const bcrypt = require('bcrypt');

class Meeting {
  static async create(meetingData) {
    const { id, name, hostId, hostName, isPublic, passwordHash, maxParticipants, expiresAt } = meetingData;
    
    const result = await db.query(
      `INSERT INTO meetings (id, name, host_id, host_name, is_public, password_hash, max_participants, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, hostId, hostName, isPublic, passwordHash, maxParticipants || 50, expiresAt]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT id, name, host_id, host_name, is_public, password_hash, max_participants, created_at, expires_at, is_active
       FROM meetings WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async addParticipant(meetingId, participantId, participantName) {
    await db.query(
      `INSERT INTO meeting_participants (meeting_id, participant_id, participant_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (meeting_id, participant_id) 
       DO UPDATE SET 
         is_active = true,
         joined_at = CURRENT_TIMESTAMP,
         left_at = NULL`,
      [meetingId, participantId, participantName]
    );
  }

  static async getParticipantCount(meetingId) {
    const result = await db.query(
      'SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = $1 AND is_active = true',
      [meetingId]
    );
    return parseInt(result.rows[0].count);
  }

  static async getParticipants(meetingId) {
    const result = await db.query(
      `SELECT participant_id, participant_name, joined_at, is_active
       FROM meeting_participants 
       WHERE meeting_id = $1 AND is_active = true
       ORDER BY joined_at ASC`,
      [meetingId]
    );
    return result.rows;
  }

  static async removeParticipant(meetingId, participantId) {
    await db.query(
      `UPDATE meeting_participants 
       SET is_active = false, left_at = CURRENT_TIMESTAMP
       WHERE meeting_id = $1 AND participant_id = $2`,
      [meetingId, participantId]
    );
  }

  static async endMeeting(meetingId) {
    await db.query('UPDATE meetings SET is_active = false WHERE id = $1', [meetingId]);
    await db.query(
      'UPDATE meeting_participants SET is_active = false, left_at = CURRENT_TIMESTAMP WHERE meeting_id = $1',
      [meetingId]
    );
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    if (!hashedPassword) return true; // Public meeting
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getUserMeetings(userId) {
    const result = await db.query(
      `SELECT id, name, host_id, host_name, is_public, max_participants, created_at, expires_at, is_active
       FROM meetings 
       WHERE host_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Meeting;