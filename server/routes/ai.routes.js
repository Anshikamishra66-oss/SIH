const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/ai.controller');

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', chatWithAssistant);

module.exports = router;
