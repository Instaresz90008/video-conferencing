// const express = require('express');
// const MeetingController = require('../controllers/meetingController');
// const authMiddleware  = require('../middleware/auth');

// const router = express.Router();

// // All meeting routes require authentication
// router.use(authMiddleware);

// router.post('/create', MeetingController.createMeeting);
// router.get('/:id', MeetingController.getMeeting);
// router.post('/:id/join', MeetingController.joinMeeting);
// router.post('/:id/leave', MeetingController.leaveMeeting);
// router.post('/:id/end', MeetingController.endMeeting);
// router.get('/:id/participants', MeetingController.getParticipants);

// module.exports = router;





















const express = require('express');
const MeetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All meeting routes require authentication
router.use(authMiddleware);

// Create meeting
router.post('/create', MeetingController.createMeeting);

// Get meeting by ID - make sure this handles encoded IDs
router.get('/:id', (req, res, next) => {
  // Decode the meeting ID to handle URL encoding
  req.params.id = decodeURIComponent(req.params.id);
  console.log('Getting meeting with ID:', req.params.id);
  next();
}, MeetingController.getMeeting);

// Join meeting
router.post('/:id/join', (req, res, next) => {
  req.params.id = decodeURIComponent(req.params.id);
  console.log('Joining meeting with ID:', req.params.id);
  next();
}, MeetingController.joinMeeting);

// Leave meeting
router.post('/:id/leave', (req, res, next) => {
  req.params.id = decodeURIComponent(req.params.id);
  next();
}, MeetingController.leaveMeeting);

// End meeting
router.post('/:id/end', (req, res, next) => {
  req.params.id = decodeURIComponent(req.params.id);
  next();
}, MeetingController.endMeeting);

// Get participants
router.get('/:id/participants', (req, res, next) => {
  req.params.id = decodeURIComponent(req.params.id);
  next();
}, MeetingController.getParticipants);

module.exports = router;