Open the backend service's Logs tab in Render and filter for [Health]. The server writes the detailed JSON report after the initial database connection attempt and every five minutes while the service runs. Each of the 18 feature entries includes its API path, status, statusCode, and a safe explanation.

Checks ping MongoDB and perform a bounded, read-only query against each required collection. Empty collections are healthy. Authentication, payments, and AI also require their respective JWT, Razorpay, and OpenAI configuration. A passing check indicates dependency readiness. External provider credentials and write operations are outside the scope of these checks.

The public /health route is the lightweight liveness probe for Render and the frontend. The detailed report is available in the service logs.

Run the health tests with `node --test test/health.test.js` from the server directory.
