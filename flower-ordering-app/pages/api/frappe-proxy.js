/**
 * Secure API proxy for Frappe/ERPNext
 * All requests to ERPNext go through this endpoint
 * Keeps API credentials secure on the server
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { action, endpoint, data } = req.body || {};

  // Validate required environment variables
  if (!process.env.FRAPPE_URL || !process.env.FRAPPE_API_KEY || !process.env.FRAPPE_API_SECRET) {
    return res.status(500).json({
      error: 'ERPNext configuration missing on server',
      message: 'FRAPPE_URL, FRAPPE_API_KEY, and FRAPPE_API_SECRET must be set',
    });
  }

  const baseUrl = process.env.FRAPPE_URL;
  const apiKey = process.env.FRAPPE_API_KEY;
  const apiSecret = process.env.FRAPPE_API_SECRET;

  try {
    let url;
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `token ${apiKey}:${apiSecret}`,
      },
    };

    // Route-specific handling. Only POST/PUT requests get a body -
    // GET requests must not have one (Node fetch rejects them).
    if (action === 'raw') {
      // Pass-through used by the flower ordering app: { method, path, body, query }.
      // `path` is relative to /api (e.g. "/resource/Purchase Order",
      // "/method/frappe.auth.get_logged_user"). Always answers HTTP 200 with
      // { ok, status, data } so the page can show ERPNext's own message.
      const { method = 'GET', path, body: rawBody, query } = req.body || {};
      if (typeof path !== 'string' || !path.startsWith('/') || path.includes('..')) {
        return res.status(400).json({ ok: false, status: 400, data: { message: 'Invalid path' } });
      }
      const m = String(method).toUpperCase();
      if (!['GET', 'POST', 'PUT', 'DELETE'].includes(m)) {
        return res.status(400).json({ ok: false, status: 400, data: { message: 'Invalid method' } });
      }
      url = `${baseUrl}/api${path}`;
      if (query && typeof query === 'object') {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => params.append(k, typeof v === 'string' ? v : JSON.stringify(v)));
        const qs = params.toString();
        if (qs) url += (url.includes('?') ? '&' : '?') + qs;
      }
      options.method = m;
      if (m !== 'GET' && rawBody !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(rawBody);
      }
      const response = await fetch(url, options);
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text.slice(0, 500) }; }
      return res.status(200).json({ ok: response.ok, status: response.status, data });
    }

    if (action === 'query') {
      // GET a list of documents; filters/fields go in the query string
      url = `${baseUrl}/api/resource/${encodeURIComponent(endpoint)}`;
      const params = new URLSearchParams();
      if (data?.filters) params.append('filters', JSON.stringify(data.filters));
      if (data?.fields) params.append('fields', JSON.stringify(data.fields));
      if (data?.limit_page_length) params.append('limit_page_length', String(data.limit_page_length));
      if (data?.order_by) params.append('order_by', data.order_by);
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    } else if (action === 'doc') {
      // GET a single document
      url = `${baseUrl}/api/resource/${encodeURIComponent(endpoint)}/${encodeURIComponent(data.name)}`;
    } else if (action === 'create') {
      // CREATE a new document
      url = `${baseUrl}/api/resource/${encodeURIComponent(endpoint)}`;
      options.method = 'POST';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    } else if (action === 'update') {
      // UPDATE an existing document
      const { name, ...fields } = data;
      url = `${baseUrl}/api/resource/${encodeURIComponent(endpoint)}/${encodeURIComponent(name)}`;
      options.method = 'PUT';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(fields);
    } else if (action === 'submit') {
      // SUBMIT a document (for doctypes with submit workflow)
      url = `${baseUrl}/api/resource/${encodeURIComponent(endpoint)}/${encodeURIComponent(data.name)}`;
      options.method = 'PUT';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({ docstatus: 1 });
    } else {
      return res.status(400).json({ error: 'Invalid action', action });
    }

    // Make the request to ERPNext
    const response = await fetch(url, options);
    const rawText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(rawText);
    } catch {
      responseData = { raw: rawText.slice(0, 500) };
    }

    if (!response.ok) {
      const detail =
        responseData?.exception ||
        responseData?.message ||
        responseData?._error_message ||
        `HTTP ${response.status}`;
      return res.status(response.status).json({
        error: 'ERPNext API error',
        message: typeof detail === 'string' ? detail : JSON.stringify(detail),
        details: responseData,
      });
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Frappe proxy error:', error);
    return res.status(500).json({
      error: 'Failed to connect to ERPNext',
      message: error.message,
    });
  }
}

// Refresh runs several SQL queries; give each call more than the 10 s default.
export const config = { maxDuration: 60, api: { responseLimit: '50mb' } };
