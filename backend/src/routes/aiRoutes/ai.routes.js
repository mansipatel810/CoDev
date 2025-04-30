const router = require('express').Router();
const aiController = require('../../controllers/aiController/ai.controller');


router.get('/getResponse',aiController.aiController)

module.exports = router;
