/**
 * Secure API proxy for Frappe/ERPNext
 * All requests to ERPNext go through this endpoint
 * Keeps API credentials secure on the server
 */

export default async function handler(req, res) {
  const { method, body } = req;
  const { action, endpoint, data } = body;

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
    let options = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey}:${apiSecret}`,
      },
    };

    if (method === 'POST' || method === 'PUT') {
      options.body = JSON.stringify(data);
    }

    // Route-specific handling
    if (action === 'query') {
      // GET data from ERPNext
      url = `${baseUrl}/api/resource/${endpoint}`;
      if (data?.filters) {
        const params = new URLSearchParams();
        params.append('filters', JSON.stringify(data.filters));
        if (data.fields) params.append('fields', JSON.stringify(data.fields));
        if (data.limit_page_length) params.append('limit_page_length', data.limit_page_length);
        url += `?${params.toString()}`;
      }
      options.method = 'GET';
    } else if (action === 'doc') {
      // GET a single document
      url = `${baseUrl}/api/resource/${endpoint}/${data.name}`;
      options.method = 'GET';
    } else if (action === 'create') {
      // CREATE a new document
      url = `${baseUrl}/api/resource/${endpoint}`;
      options.method = 'POST';
    } else if (action === 'update') {
      // UPDATE an existing document
      url = `${baseUrl}/api/resource/${endpoint}/${data.name}`;
      options.method = 'PUT';
    } else if (action === 'submit') {
      // SUBMIT a document (for doctypes with submit workflow)
      url = `${baseUrl}/api/resource/${endpoint}/${data.name}`;
      options.method = 'PUT';
      options.body = JSON.stringify({ docstatus: 1 });
    } else {
      return res.status(400).json({ error: 'Invalid action', action });
    }

    // Make the request to ERPNext
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'ERPNext API error',
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
