import {
  CloudResource,
  DetectionRule,
  WasteDetection,
  Alert,
  Recommendation,
  DashboardSummary,
  AlertStatus,
} from '../types/cloud';

const API_BASE = '/api';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  const json = await res.json();
  return json.data;
}

export async function fetchResources(params?: {
  service?: string;
  status?: string;
  wasteStatus?: string;
  severity?: string;
  search?: string;
}): Promise<CloudResource[]> {
  const query = new URLSearchParams();
  if (params?.service && params.service !== 'ALL') query.set('service', params.service);
  if (params?.status && params.status !== 'ALL') query.set('status', params.status);
  if (params?.wasteStatus && params.wasteStatus !== 'ALL') query.set('wasteStatus', params.wasteStatus);
  if (params?.severity && params.severity !== 'ALL') query.set('severity', params.severity);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/resources?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch resources');
  const json = await res.json();
  return json.data;
}

export async function fetchResourceDetails(id: string): Promise<CloudResource & {
  detections: WasteDetection[];
  alerts: Alert[];
  recommendations: Recommendation[];
}> {
  const res = await fetch(`${API_BASE}/resources/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to fetch resource ${id}`);
  const json = await res.json();
  return json.data;
}

export async function fetchWasteDetections(params?: { category?: string; severity?: string }): Promise<WasteDetection[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'ALL') query.set('category', params.category);
  if (params?.severity && params.severity !== 'ALL') query.set('severity', params.severity);

  const res = await fetch(`${API_BASE}/waste?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch waste detections');
  const json = await res.json();
  return json.data;
}

export async function fetchCostBreakdown(): Promise<any> {
  const res = await fetch(`${API_BASE}/costs`);
  if (!res.ok) throw new Error('Failed to fetch cost analysis');
  const json = await res.json();
  return json.data;
}

export async function fetchAlerts(params?: { status?: string; severity?: string }): Promise<Alert[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') query.set('status', params.status);
  if (params?.severity && params.severity !== 'ALL') query.set('severity', params.severity);

  const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const json = await res.json();
  return json.data;
}

export async function updateAlertStatus(id: string, status: AlertStatus): Promise<Alert> {
  const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update alert');
  const json = await res.json();
  return json.data;
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const json = await res.json();
  return json.data;
}

export async function updateRecommendationStatus(id: string, status: 'Pending' | 'Approved' | 'Applied' | 'Dismissed'): Promise<Recommendation> {
  const res = await fetch(`${API_BASE}/recommendations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update recommendation');
  const json = await res.json();
  return json.data;
}

export async function fetchRules(): Promise<DetectionRule[]> {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  const json = await res.json();
  return json.data;
}

export async function updateRule(
  id: string,
  updates: { enabled?: boolean; threshold?: number | string; severity?: string }
): Promise<{ rule: DetectionRule; summary: DashboardSummary }> {
  const res = await fetch(`${API_BASE}/rules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update rule');
  const json = await res.json();
  return { rule: json.data, summary: json.summary };
}

export async function triggerReEvaluation(): Promise<{ message: string; summary: DashboardSummary }> {
  const res = await fetch(`${API_BASE}/rules/reevaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to trigger re-evaluation');
  const json = await res.json();
  return json;
}

export async function loginAdmin(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Authentication failed');
  }
  return (await res.json()).user;
}
