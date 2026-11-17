Open `BACKEND_URL/api/health` in a browser to view the JSON health report. No login is required and no frontend changes are needed.

The HTTP response is `200` when all checks pass, or `503` when any feature is unavailable. Each of the 18 feature entries includes its API path, `up`/`down` status, `statusCode`, and a safe explanation. Responses are not cached.

Checks ping MongoDB and perform a bounded, read-only query against each required collection. Empty collections are healthy. Authentication, payments, and AI also require their respective JWT, Razorpay, and OpenAI configuration. These checks do not validate credentials with external providers or exercise writes or complete business workflows. A passing check therefore indicates dependency readiness, not a guarantee that every operation succeeds.

The existing `/health` route remains a lightweight process liveness probe for Render. Use `/api/health` for feature monitoring. If the backend process itself is offline, this endpoint cannot respond; an external uptime monitor must detect the connection failure.

Run health checks with `node --test test/health.test.js` from the `server` directory.
