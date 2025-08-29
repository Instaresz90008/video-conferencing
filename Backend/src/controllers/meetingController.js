const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Meeting = require('../models/Meeting');
const { generateMeetingId } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET;

class MeetingController {
  static async createMeeting(req, res) {
    try {
      const { name, hostName, isPublic, password, maxParticipants, duration } = req.body;
      
      if (!name || !hostName) {
        return res.status(400).json({ error: 'Name and hostName are required' });
      }

      const meetingId = generateMeetingId();
      const hostId = req.user.userId; // Fixed: should use userId consistently
      
      let expiresAt = null;
      if (duration) {
        expiresAt = new Date(Date.now() + duration * 60000);
      }

      // Hash password if provided
      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const meetingData = {
        id: meetingId,
        name,
        hostId,
        hostName,
        isPublic,
        passwordHash, // Store hashed password instead of plain text
        maxParticipants,
        expiresAt
      };

      const meeting = await Meeting.create(meetingData);
      
      // Format response
      const response = {
        id: meeting.id,
        name: meeting.name,
        hostId: meeting.host_id,
        hostName: meeting.host_name,
        isPublic: meeting.is_public,
        maxParticipants: meeting.max_participants,
        createdAt: meeting.created_at,
        expiresAt: meeting.expires_at,
        isActive: meeting.is_active
      };

      // Note: Socket emission would be handled in the route layer
      res.status(201).json({
        message: 'Meeting created successfully',
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  }

  static async getMeeting(req, res) {
    try {
      const { id } = req.params;
      const meeting = await Meeting.findById(id);

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const response = {
        id: meeting.id,
        name: meeting.name,
        hostId: meeting.host_id,
        hostName: meeting.host_name,
        isPublic: meeting.is_public,
        maxParticipants: meeting.max_participants,
        createdAt: meeting.created_at,
        expiresAt: meeting.expires_at,
        isActive: meeting.is_active
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({ error: 'Failed to fetch meeting' });
    }
  }

  static async joinMeeting(req, res) {
    try {
      const { id: meetingId } = req.params;
      const { participantName, password } = req.body;

      if (!participantName) {
        return res.status(400).json({ error: 'Participant name is required' });
      }

      const meeting = await Meeting.findById(meetingId);
      if (!meeting || !meeting.is_active) {
        return res.status(404).json({ error: 'Meeting not found or inactive' });
      }

      // Check expiration
      if (meeting.expires_at && new Date() > new Date(meeting.expires_at)) {
        return res.status(410).json({ error: 'Meeting has expired' });
      }

      // Check password for private meetings
      if (!meeting.is_public && meeting.password_hash) {
        if (!password) {
          return res.status(401).json({ error: 'Password required for private meeting' });
        }
        
        // Use bcrypt.compare instead of custom method
        const validPassword = await bcrypt.compare(password, meeting.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid password' });
        }
      }

      // Check participant limit
      const participantCount = await Meeting.getParticipantCount(meetingId);
      if (participantCount >= meeting.max_participants) {
        return res.status(409).json({ error: 'Meeting is full' });
      }

      // Add participant
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await Meeting.addParticipant(meetingId, participantId, participantName);

      // Generate session token with consistent algorithm
      const token = jwt.sign(
        { participantId, meetingId, participantName, type: 'session' },
        JWT_SECRET,
        { expiresIn: '24h', algorithm: 'HS512' }
      );

      res.json({ 
        success: true, 
        message: 'Joined meeting successfully',
        data: {
          token, 
          participantId 
        }
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
      res.status(500).json({ error: 'Failed to join meeting' });
    }
  }

  static async leaveMeeting(req, res) {
    try {
      const { id: meetingId } = req.params;
      const { participantId } = req.body;

      if (!participantId) {
        return res.status(400).json({ error: 'Participant ID is required' });
      }

      await Meeting.removeParticipant(meetingId, participantId);
      res.json({ 
        success: true,
        message: 'Left meeting successfully'
      });
    } catch (error) {
      console.error('Error leaving meeting:', error);
      res.status(500).json({ error: 'Failed to leave meeting' });
    }
  }

  static async endMeeting(req, res) {
    try {
      const { id: meetingId } = req.params;

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      // Fixed: should use userId consistently
      if (meeting.host_id !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Only the host can end the meeting' });
      }

      await Meeting.endMeeting(meetingId);
      res.json({ 
        success: true,
        message: 'Meeting ended successfully'
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      res.status(500).json({ error: 'Failed to end meeting' });
    }
  }

  static async getParticipants(req, res) {
    try {
      const { id: meetingId } = req.params;
      
      // Check if meeting exists
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const participants = await Meeting.getParticipants(meetingId);
      res.json({
        success: true,
        data: participants
      });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  }
}

module.exports = MeetingController;