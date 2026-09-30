import Head from 'next/head';
import Script from 'next/script';

// The app's markup, exactly as in the original artifact. The planning
// engine in /public/flower-app.js renders into these elements.
const MARKUP = "<div class=\"wrap\">\n  <header class=\"top\">\n    <div>\n      <h1>Flower ordering</h1>\n      <div class=\"meta\" id=\"snapMeta\"></div>\n      <div class=\"meta\" id=\"liveStatus\" role=\"status\"></div>\n    </div>\n    <div style=\"display:flex;gap:8px;flex-wrap:wrap\">\n      <button class=\"btn ghost\" id=\"refreshBtn\" type=\"button\">Refresh from ERPNext</button>\n      <button class=\"btn\" id=\"poBtn\" type=\"button\">Download PO file for ERPNext</button>\n    </div>\n  </header>\n\n  <section class=\"card hero\" id=\"strip\"></section>\n\n  <nav class=\"tabs\" id=\"tabs\" role=\"tablist\"></nav>\n\n  <main id=\"view\"></main>\n\n  <details class=\"card set\" id=\"set\">\n    <summary><span id=\"sumLine\"></span><b>Change planning rules</b></summary>\n    <div class=\"set-grid\">\n      <div>\n        <div class=\"field\"><label for=\"basis\">Demand basis<small>Which consumption window sets the daily rate</small></label>\n          <select id=\"basis\"><option value=\"blend\">Blended (50% 7d, 30% 14d, 20% 28d)</option><option value=\"7\">Last 7 days</option><option value=\"14\">Last 14 days</option><option value=\"28\">Last 28 days</option></select></div>\n        <div class=\"field\"><label for=\"pack\">Round stems up to<small>Only for items with no PO history; others use their usual minimum and pack size</small></label><input type=\"number\" id=\"pack\" min=\"1\" max=\"100\" step=\"1\"></div>\n        <div class=\"field\"><label for=\"flex\">Holland \"twice or once\" items<small>How often you expect to order them</small></label>\n          <select id=\"flex\"><option value=\"1\">Once a week</option><option value=\"2\">Twice a week</option></select></div>\n        <div class=\"field\"><label class=\"switch\" for=\"wd\"><input type=\"checkbox\" id=\"wd\"> Weight forecast by day of week</label></div>\n        <div class=\"field\"><label class=\"switch\" for=\"po\"><input type=\"checkbox\" id=\"po\"> Deduct open purchase orders</label></div>\n      </div>\n      <div>\n        <div class=\"scroll\"><table>\n          <thead><tr><th>Group</th><th>Lead time</th><th>Cover after arrival</th><th>Target stock (days)</th><th>Safety %</th><th>Shelf life (default)</th></tr></thead>\n          <tbody id=\"gtBody\"></tbody>\n        </table></div>\n        <div class=\"hint\">Order-up-to level = daily rate x target stock days x (1 + safety). Suggested qty = that level minus stock, open POs and Gulf standing deliveries due in the window. Holland items are sized to last until the shipment after next lands. Each item has its own shelf life from the shelf life sheet (the group value is only the default for unlisted items): no order or hub top-up goes beyond what can be used within that shelf life, and stock beyond it is flagged as excess. <button class=\"btn ghost sm\" id=\"resetBtn\" type=\"button\">Reset rules</button></div>\n      </div>\n    </div>\n  </details>\n  <div class=\"hint\" id=\"foot\"></div>\n</div>\n<div class=\"toast\" id=\"toast\" role=\"status\"></div>";

export default function Home() {
  return (
    <>
      <Head>
        <title>Flower Ordering</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div id="app-root" dangerouslySetInnerHTML={{ __html: MARKUP }} />
      <Script src="/flower-app.js" strategy="afterInteractive" />
    </>
  );
}
