const mongoose = require('mongoose');

const featureDefinitions = {
  auth: ['User'],
  items: ['Item'],
  contact: ['Contact'],
  members: ['Member'],
  donations: ['Donation', 'Member', 'CollectionAgent'],
  payment: ['Donation', 'Member'],
  devotees: ['Devotee', 'ActivityLog'],
  batches: ['PrintBatch', 'Book', 'ActivityLog'],
  books: ['Book', 'PrintBatch', 'Devotee', 'ActivityLog'],
  dispatch: ['DispatchLog', 'Devotee', 'ActivityLog'],
  returns: ['ReturnLog', 'Book', 'Devotee', 'ActivityLog'],
  settlements: ['SettlementLog', 'Book', 'Devotee', 'ActivityLog'],
  ai: ['AIConversation', 'AIInsight', 'ActivityLog', 'Devotee', 'Book', 'PrintBatch', 'DispatchLog', 'ReturnLog', 'SettlementLog'],
  agents: ['CollectionAgent', 'Donation'],
  events: ['Event'],
  blogs: ['Blog'],
  gallery: ['Gallery'],
  backup: ['Member', 'Donation', 'CollectionAgent', 'Event', 'Blog', 'Gallery', 'Contact', 'Item', 'User'],
};

const result = (healthy, message) => ({
  status: healthy ? 'up' : 'down',
  statusCode: healthy ? 200 : 503,
  message,
});

// Bound even a stalled driver operation; never expose records or database errors.
async function boundedCheck(operation, timeoutMs) {
  let timer;
  try {
    await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Health check timeout')), timeoutMs);
      }),
    ]);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function createHealthCheck({ connection = mongoose.connection, env = process.env,
  getModel = name => require(`../models/${name}`), timeoutMs = 2000 } = {}) {
  return async () => {
    const started = Date.now();
    const connected = connection.readyState === 1;
    const databaseUp = connected && await boundedCheck(
      () => connection.db.command({ ping: 1 }, { timeoutMS: timeoutMs }), timeoutMs
    );
    const modelNames = [...new Set(Object.values(featureDefinitions).flat())];
    const checks = Object.fromEntries(await Promise.all(modelNames.map(async name => [
      name,
      databaseUp && await boundedCheck(
        () => getModel(name).findOne({}, { _id: 1 }).maxTimeMS(timeoutMs).lean().exec(), timeoutMs
      ),
    ])));
    const configured = name => Boolean((env[name] || '').trim());
    const features = Object.fromEntries(Object.entries(featureDefinitions).map(([name, models]) => {
      const readable = models.every(model => checks[model]);
      const missingConfig = name === 'auth' ? !configured('JWT_SECRET')
        : name === 'payment' ? !configured('RAZORPAY_KEY_ID') || !configured('RAZORPAY_KEY_SECRET')
        : name === 'ai' ? !configured('OPENAI_API_KEY') : false;
      return [name, {
        endpoint: `/api/${name}`,
        ...result(readable && !missingConfig, !readable
          ? 'Required database reads are unavailable.'
          : missingConfig ? 'Required service configuration is missing.'
            : 'Required database reads and configuration checks passed.'),
      }];
    }));
    const healthy = databaseUp && Object.values(features).every(feature => feature.statusCode === 200);
    return {
      status: healthy ? 'healthy' : 'unhealthy',
      statusCode: healthy ? 200 : 503,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: Date.now() - started,
      database: result(databaseUp, databaseUp ? 'Database ping succeeded.' : 'Database is unavailable.'),
      features,
      checkScope: 'Read-only database probes and required configuration checks. External providers and write operations are not tested.',
    };
  };
}

module.exports = { checkHealth: createHealthCheck(), createHealthCheck };
