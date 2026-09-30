# Flower Ordering System

A production-ready flower ordering and inventory management system connected to ERPNext/Frappe.

## Features

- Real-time inventory tracking across multiple hubs
- Demand forecasting based on consumption history
- Purchase order management with supplier integration
- Secure API connection to ERPNext (no credentials exposed to frontend)
- Dark mode support
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: Next.js + React
- **Backend**: Next.js API routes (serverless)
- **Hosting**: Vercel
- **ERP**: ERPNext/Frappe

## Setup Instructions

### 1. Clone and Install (Local Development)

```bash
git clone <your-repo-url>
cd flower-ordering-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your ERPNext details:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
FRAPPE_URL=https://your-erpnext-instance.com
FRAPPE_API_KEY=your_api_key_here
FRAPPE_API_SECRET=your_api_secret_here
```

**How to get Frappe API credentials:**
1. Log in to your ERPNext instance
2. Go to Settings → API Settings
3. Create a new API key + secret pair
4. Copy the values into `.env.local`

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

#### Option B: Connect GitHub to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Add environment variables in Project Settings → Environment Variables:
   - `FRAPPE_URL`
   - `FRAPPE_API_KEY`
   - `FRAPPE_API_SECRET`
6. Deploy

### 5. First Deploy

On your first deployment, Vercel will:
- Install dependencies
- Build the Next.js app
- Deploy to a live URL

You'll get a URL like: `https://flower-ordering-app.vercel.app`

## How It Works

### Frontend
- HTML/CSS/JS application with flower ordering interface
- Makes requests to your Next.js backend API
- All requests proxied through `/api/frappe-proxy`

### Backend (API Proxy)
The `/api/frappe-proxy` endpoint:
- Accepts requests from the frontend
- Keeps Frappe API credentials safe (server-side only)
- Forwards requests to your ERPNext instance
- Handles authentication and error responses
- Returns data to the frontend

### Data Flow

```
Frontend (React)
    ↓
/api/frappe-proxy (Next.js API route)
    ↓
Your ERPNext Instance (Frappe API)
    ↓
ERPNext Database
```

## Key API Endpoints

The proxy supports these actions:

- **`query`** - Fetch records: `{ action: 'query', endpoint: 'Item', data: { filters: [...] } }`
- **`doc`** - Get single document: `{ action: 'doc', endpoint: 'Item', data: { name: 'MC001' } }`
- **`create`** - Create new: `{ action: 'create', endpoint: 'Purchase Order', data: {...} }`
- **`update`** - Update existing: `{ action: 'update', endpoint: 'Purchase Order', data: { name: 'PO-123', ...} }`
- **`submit`** - Submit doctype: `{ action: 'submit', endpoint: 'Purchase Order', data: { name: 'PO-123' } }`

## Security Notes

- **Never** commit `.env` files with real credentials
- Use `.env.local` for local development (in `.gitignore`)
- Vercel's environment variables are encrypted at rest
- API credentials are only accessible on the server
- Frontend makes NO direct calls to ERPNext

## Troubleshooting

### "ERPNext configuration missing"
- Check that `FRAPPE_URL`, `FRAPPE_API_KEY`, and `FRAPPE_API_SECRET` are set
- On Vercel: Go to Project Settings → Environment Variables
- On local: Check `.env.local` exists and has values

### API calls failing with 403/401
- Verify your API key and secret are correct
- Check that the API user has proper permissions in ERPNext
- Ensure Frappe API is enabled on your instance

### Build fails on Vercel
- Check `npm run build` works locally
- Ensure `package.json` has all required dependencies
- Check for syntax errors in Next.js config

## Development

### Project Structure
```
flower-ordering-app/
├── pages/
│   ├── _app.js           # Next.js app wrapper
│   ├── index.js          # Main page
│   └── api/
│       └── frappe-proxy.js  # Secure Frappe API proxy
├── styles/
│   └── globals.css       # All styling
├── public/
│   └── app.js            # Frontend app logic
├── package.json
├── next.config.js
├── vercel.json           # Vercel deployment config
└── .env.example          # Template for env vars
```

### Adding Features

To add new functionality that talks to ERPNext:

1. **In the frontend**, call the proxy:
```javascript
const response = await fetch('/api/frappe-proxy', {
  method: 'POST',
  body: JSON.stringify({
    action: 'query',
    endpoint: 'Item',
    data: { filters: [['enabled', '=', 1]] }
  })
});
```

2. **The proxy** automatically adds auth headers and handles the request

3. **Update `pages/api/frappe-proxy.js`** if you need new action types

## Production Checklist

- [ ] Environment variables set on Vercel
- [ ] Test read operations (inventory, items)
- [ ] Test write operations (create PO)
- [ ] Verify error handling
- [ ] Set up monitoring/logging
- [ ] Document any custom fields
- [ ] Create backup of ERPNext instance

## Support & Debugging

Enable logging by adding this to `pages/api/frappe-proxy.js`:
```javascript
console.log('Request to:', url);
console.log('Action:', action);
```

Check Vercel logs: Dashboard → Select project → Deployments → Function logs

## License

Proprietary - BloomingBox
