import { authFetch } from './api';

function getApiBase() {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
  envUrl = envUrl.replace(/\/+$/, '');
  if (envUrl !== '' && !envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl || '/api';
}

const API_BASE = getApiBase();

/* ==================================================================
   AI Operations Assistant API
================================================================== */
export async function aiChatAPI(message, sessionId = 'admin-ops-session') {
  const res = await authFetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'AI assistant failed to respond.');
  }
  return await res.json();
}

export async function getAIAnalyticsAPI() {
  const res = await authFetch(`${API_BASE}/ai/analytics`);
  if (!res.ok) throw new Error('Failed to load analytics.');
  return await res.json();
}

export async function getAIInsightsAPI() {
  const res = await authFetch(`${API_BASE}/ai/insights`);
  if (!res.ok) throw new Error('Failed to load insights.');
  return await res.json();
}

export async function executeAIActionAPI(actionType, payload) {
  const res = await authFetch(`${API_BASE}/ai/execute-action`, {
    method: 'POST',
    body: JSON.stringify({ actionType, payload, confirmed: true }),
  });
  if (!res.ok) throw new Error('Failed to execute administrative action.');
  return await res.json();
}

/* ==================================================================
   Devotees Management API
================================================================== */
export async function getDevoteesAPI(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/devotees?${query}`);
  if (!res.ok) throw new Error('Failed to load devotees.');
  return await res.json();
}

export async function createDevoteeAPI(devotee) {
  const res = await authFetch(`${API_BASE}/devotees`, {
    method: 'POST',
    body: JSON.stringify(devotee),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create devotee.');
  }
  return await res.json();
}

export async function updateDevoteeAPI(memberId, data) {
  const res = await authFetch(`${API_BASE}/devotees/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update devotee.');
  return await res.json();
}

/* ==================================================================
   Print Batch Management API
================================================================== */
export async function getBatchesAPI() {
  const res = await authFetch(`${API_BASE}/batches`);
  if (!res.ok) throw new Error('Failed to load print batches.');
  return await res.json();
}

export async function createBatchAPI(batch) {
  const res = await authFetch(`${API_BASE}/batches`, {
    method: 'POST',
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create print batch.');
  }
  return await res.json();
}

export async function toggleBatchStatusAPI(id) {
  const res = await authFetch(`${API_BASE}/batches/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to toggle batch status.');
  return await res.json();
}

/* ==================================================================
   Bill Book Inventory API
================================================================== */
export async function getBooksAPI(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/books?${query}`);
  if (!res.ok) throw new Error('Failed to load books.');
  return await res.json();
}

export async function proposeBooksAPI(memberId, quantity, batchName) {
  const res = await authFetch(`${API_BASE}/books/propose-issue`, {
    method: 'POST',
    body: JSON.stringify({ memberId, quantity, batchName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to propose books for issue.');
  }
  return await res.json();
}

export async function getAlternativeBookAPI(batchName, excludeNumbers = '') {
  const res = await authFetch(
    `${API_BASE}/books/alternative?batchName=${encodeURIComponent(batchName)}&excludeNumbers=${encodeURIComponent(excludeNumbers)}`
  );
  if (!res.ok) throw new Error('Failed to find replacement book.');
  return await res.json();
}

export async function confirmIssueBooksAPI(memberId, bookNumbers) {
  const res = await authFetch(`${API_BASE}/books/confirm-issue`, {
    method: 'POST',
    body: JSON.stringify({ memberId, bookNumbers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to confirm book issue.');
  }
  return await res.json();
}

/* ==================================================================
   Dispatch Management API
================================================================== */
export async function getDispatchesAPI(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/dispatch?${query}`);
  if (!res.ok) throw new Error('Failed to load dispatches.');
  return await res.json();
}

export async function logDispatchAPI(dispatchData) {
  const res = await authFetch(`${API_BASE}/dispatch`, {
    method: 'POST',
    body: JSON.stringify(dispatchData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to log dispatch.');
  }
  return await res.json();
}

/* ==================================================================
   Return / Bounce Management API
================================================================== */
export async function getReturnsAPI(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/returns?${query}`);
  if (!res.ok) throw new Error('Failed to load returns.');
  return await res.json();
}

export async function processReturnAPI(returnData) {
  const res = await authFetch(`${API_BASE}/returns`, {
    method: 'POST',
    body: JSON.stringify(returnData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to process return.');
  }
  return await res.json();
}

/* ==================================================================
   Final Settlement Management API
================================================================== */
export async function getSettlementsAPI(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/settlements?${query}`);
  if (!res.ok) throw new Error('Failed to load settlements.');
  return await res.json();
}

export async function getSettlementPreviewAPI(memberId) {
  const res = await authFetch(`${API_BASE}/settlements/preview/${memberId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to load settlement preview.');
  }
  return await res.json();
}

export async function confirmSettlementAPI(settlementData) {
  const res = await authFetch(`${API_BASE}/settlements/confirm`, {
    method: 'POST',
    body: JSON.stringify(settlementData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to confirm settlement.');
  }
  return await res.json();
}

/* ==================================================================
   Excel Report Download Helper
================================================================== */
export async function downloadExcelReportAPI(type) {
  const res = await authFetch(`${API_BASE}/ai/reports/${type}`);
  if (!res.ok) throw new Error(`Failed to download ${type} report.`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devoteedesk-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
