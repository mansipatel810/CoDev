const router = require('express').Router();
const messageController = require('../../controllers/messageController/message.controller');

const authMiddleware = require('../../middlewares/authMiddleware');


router.get('/project/:projectId', authMiddleware, messageController.getProjectMessages);

module.exports = router;
