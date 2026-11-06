const express = require('express');
const router = express.Router();
const {
  getAgents,
  createAgent,
  settleAgentCollections,
} = require('../controllers/agentController');

router.route('/')
  .get(getAgents)
  .post(createAgent);

router.post('/:agentCode/settle', settleAgentCollections);

module.exports = router;

