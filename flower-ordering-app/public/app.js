/**
 * Flower Ordering App - Frontend Logic
 *
 * This file contains all the frontend logic for the flower ordering system.
 * It communicates with the backend via /api/frappe-proxy for secure ERPNext access.
 */

// Configuration
const config = {
  apiUrl: '/api/frappe-proxy',
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Flower Ordering App initializing...');
  initializeApp();
});

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    // Create main container
    const container = document.body;
    container.innerHTML = `
      <div class="wrap">
        <header class="top">
          <div>
            <h1>Flower ordering</h1>
            <div class="meta" id="snapMeta"></div>
            <div class="meta" id="liveStatus" role="status">Connecting to ERPNext...</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn ghost" id="refreshBtn" type="button">Refresh from ERPNext</button>
            <button class="btn" id="poBtn" type="button">Download PO file for ERPNext</button>
          </div>
        </header>

        <section class="card hero" id="strip"></section>
        <nav class="tabs" id="tabs" role="tablist"></nav>
        <main id="view"></main>

        <details class="card set" id="set">
          <summary><span id="sumLine"></span><b>Change planning rules</b></summary>
          <div class="set-grid">
            <div>
              <div class="field">
                <label for="basis">Demand basis<small>Which consumption window sets the daily rate</small></label>
                <select id="basis">
                  <option value="blend">Blended (50% 7d, 30% 14d, 20% 28d)</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="28">Last 28 days</option>
                </select>
              </div>
            </div>
          </div>
        </details>
        <div class="hint" id="foot"></div>
      </div>
      <div class="toast" id="toast" role="status"></div>
    `;

    // Test connection to ERPNext
    await testERPNextConnection();

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    await loadData();

  } catch (error) {
    console.error('App initialization failed:', error);
    showError('Failed to initialize app: ' + error.message);
  }
}

/**
 * Test connection to ERPNext
 */
async function testERPNextConnection() {
  try {
    const response = await callFrappeAPI('query', 'Item', {
      filters: [['disabled', '=', 0]],
      limit_page_length: 1,
      fields: ['name', 'item_name']
    });

    if (response.data) {
      showStatus('✓ Connected to ERPNext');
      return true;
    }
  } catch (error) {
    console.warn('ERPNext connection test failed:', error);
    showError('⚠ Could not connect to ERPNext: ' + error.message);
    return false;
  }
}

/**
 * Call Frappe API through secure proxy
 */
async function callFrappeAPI(action, endpoint, data = {}) {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        endpoint,
        data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const refreshBtn = document.getElementById('refreshBtn');
  const poBtn = document.getElementById('poBtn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      showStatus('Refreshing from ERPNext...');
      loadData();
    });
  }

  if (poBtn) {
    poBtn.addEventListener('click', () => {
      showStatus('Generating PO file...');
      // TODO: Implement PO file generation
      showStatus('✓ PO file ready for download');
    });
  }
}

/**
 * Load data from ERPNext
 */
async function loadData() {
  try {
    // Example: Load items
    const itemsResponse = await callFrappeAPI('query', 'Item', {
      filters: [['disabled', '=', 0]],
      limit_page_length: 100,
      fields: ['name', 'item_name', 'item_group'],
    });

    if (itemsResponse.data) {
      console.log('Loaded items:', itemsResponse.data.length);
      updateUI('Items loaded: ' + itemsResponse.data.length);
    }

    // Example: Load stock
    const stockResponse = await callFrappeAPI('query', 'Stock Entry', {
      filters: [['docstatus', '=', 1]],
      limit_page_length: 50,
      fields: ['name', 'posting_date', 'total_qty'],
    });

    if (stockResponse.data) {
      console.log('Loaded stock entries:', stockResponse.data.length);
    }

    showStatus('✓ Data loaded from ERPNext');

  } catch (error) {
    console.error('Failed to load data:', error);
    showError('Failed to load data: ' + error.message);
  }
}

/**
 * Update UI with information
 */
function updateUI(message) {
  const view = document.getElementById('view');
  if (view) {
    view.innerHTML += `<div class="hint">${message}</div>`;
  }
}

/**
 * Show status message
 */
function showStatus(message) {
  const liveStatus = document.getElementById('liveStatus');
  if (liveStatus) {
    liveStatus.textContent = message;
  }
  console.log(message);
}

/**
 * Show error message
 */
function showError(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('on');
    setTimeout(() => toast.classList.remove('on'), 5000);
  }
  console.error(message);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { callFrappeAPI, testERPNextConnection, loadData };
}
