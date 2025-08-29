const express = require('express');
const MeetingController = require('../controllers/meetingController');
const authMiddleware  = require('../middleware/auth');

const router = express.Router();

// All meeting routes require authentication
router.use(authMiddleware);

router.post('/create', MeetingController.createMeeting);
router.get('/:id', MeetingController.getMeeting);
router.post('/:id/join', MeetingController.joinMeeting);
router.post('/:id/leave', MeetingController.leaveMeeting);
router.post('/:id/end', MeetingController.endMeeting);
router.get('/:id/participants', MeetingController.getParticipants);

module.exports = router;