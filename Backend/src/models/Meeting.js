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

  // UPDATED: Add isHost parameter to track host status
static async addParticipant(meetingId, participantId, participantName, isHost = false) {
  try {
    // First check if participant already exists and is active
    const existingParticipant = await this.findParticipantByName(meetingId, participantName);

    if (existingParticipant) {
      console.log('Participant already exists, reactivating:', existingParticipant);

      // Reactivate existing participant instead of creating new one
      const updateQuery = `
        UPDATE meeting_participants 
        SET is_active = true, 
            joined_at = CURRENT_TIMESTAMP,
            is_host = $3
        WHERE meeting_id = $1 AND participant_name = $2
        RETURNING *
      `;
      const result = await db.query(updateQuery, [meetingId, participantName, isHost]);
      return result.rows[0];
    }

    // Create new participant - let database auto-generate the ID
    const query = `
      INSERT INTO meeting_participants (
        meeting_id, participant_name, is_host, is_active, joined_at
      ) VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    // Remove participantId from the parameters since we're not inserting it
    const result = await db.query(query, [meetingId, participantName, isHost]);
    console.log('New participant added:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
}


  static async getParticipantCount(meetingId) {
    const result = await db.query(
      'SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = $1 AND is_active = true',
      [meetingId]
    );
    return parseInt(result.rows[0].count);
  }

  // UPDATED: Include is_host in the participant data
  static async getParticipants(meetingId) {
    const result = await db.query(
      `SELECT participant_id, participant_name, joined_at, is_active, is_host
       FROM meeting_participants 
       WHERE meeting_id = $1 AND is_active = true
       ORDER BY is_host DESC, joined_at ASC`,
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

  // NEW: Get participant info including host status
  static async getParticipantInfo(meetingId, participantId) {
    const result = await db.query(
      `SELECT participant_id, participant_name, joined_at, is_active, is_host
       FROM meeting_participants 
       WHERE meeting_id = $1 AND participant_id = $2`,
      [meetingId, participantId]
    );
    return result.rows[0];
  }

  // NEW: Check if a user is the host of a meeting
  static async isUserHost(meetingId, userId) {
    const result = await db.query(
      `SELECT host_id FROM meetings WHERE id = $1`,
      [meetingId]
    );

    if (!result.rows[0]) return false;
    return result.rows[0].host_id === userId;
  }


  static async findParticipantByName(meetingId, participantName) {
    try {
      const query = `
        SELECT * FROM meeting_participants 
        WHERE meeting_id = $1 AND participant_name = $2 AND is_active = true
        ORDER BY joined_at DESC
        LIMIT 1
      `;
      const result = await db.query(query, [meetingId, participantName]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding participant by name:', error);
      return null;
    }
  }

  // CRITICAL FIX: Update addParticipant to handle host status correctly
  static async addParticipant(meetingId, participantId, participantName, isHost = false) {
    try {
      // First check if participant already exists and is active
      const existingParticipant = await this.findParticipantByName(meetingId, participantName);

      if (existingParticipant) {
        console.log('Participant already exists, reactivating:', existingParticipant);

        // Reactivate existing participant instead of creating new one
        const updateQuery = `
          UPDATE meeting_participants 
          SET is_active = true, 
              joined_at = CURRENT_TIMESTAMP,
              is_host = $3
          WHERE meeting_id = $1 AND participant_name = $2
          RETURNING *
        `;
        const result = await db.query(updateQuery, [meetingId, participantName, isHost]);
        return result.rows[0];
      }

      // Create new participant if doesn't exist
      const query = `
        INSERT INTO meeting_participants (
          id, meeting_id, participant_name, is_host, is_active, joined_at
        ) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.query(query, [participantId, meetingId, participantName, isHost]);
      console.log('New participant added:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  // CRITICAL FIX: Deactivate instead of removing (allows rejoining)
  static async deactivateParticipant(meetingId, participantId) {
    try {
      const query = `
        UPDATE meeting_participants 
        SET is_active = false, left_at = CURRENT_TIMESTAMP
        WHERE meeting_id = $1 AND id = $2
        RETURNING *
      `;
      const result = await db.query(query, [meetingId, participantId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deactivating participant:', error);
      throw error;
    }
  }

  // Update removeParticipant to use deactivation
  static async removeParticipant(meetingId, participantId) {
    return this.deactivateParticipant(meetingId, participantId);
  }

  // CRITICAL FIX: Only count active participants
  static async getParticipantCount(meetingId) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM meeting_participants 
        WHERE meeting_id = $1 AND is_active = true
      `;
      const result = await db.query(query, [meetingId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting participant count:', error);
      return 0;
    }
  }

  // CRITICAL FIX: Only return active participants with correct host status
  static async getParticipants(meetingId) {
    try {
      const query = `
        SELECT 
          id,
          participant_name as name,
          is_host,
          joined_at,
          is_active
        FROM meeting_participants 
        WHERE meeting_id = $1 AND is_active = true
        ORDER BY is_host DESC, joined_at ASC
      `;
      const result = await db.query(query, [meetingId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting participants:', error);
      return [];
    }
  }

  // Clean up inactive participants (optional - run periodically)
  static async cleanupInactiveParticipants(meetingId, olderThanMinutes = 30) {
    try {
      const query = `
        DELETE FROM meeting_participants 
        WHERE meeting_id = $1 
        AND is_active = false 
        AND left_at < (CURRENT_TIMESTAMP - INTERVAL '${olderThanMinutes} minutes')
      `;
      const result = await db.query(query, [meetingId]);
      console.log(`Cleaned up ${result.rowCount} inactive participants from meeting ${meetingId}`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up inactive participants:', error);
      return 0;
    }
  }

  // Method to transfer host status (if needed)
  static async transferHostStatus(meetingId, newHostParticipantId) {
    try {
      // Remove host status from all participants in this meeting
      await db.query(
        'UPDATE meeting_participants SET is_host = false WHERE meeting_id = $1',
        [meetingId]
      );

      // Set new host
      const result = await db.query(
        `UPDATE meeting_participants 
         SET is_host = true 
         WHERE meeting_id = $1 AND id = $2 AND is_active = true
         RETURNING *`,
        [meetingId, newHostParticipantId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error transferring host status:', error);
      throw error;
    }
  }
}

module.exports = Meeting;