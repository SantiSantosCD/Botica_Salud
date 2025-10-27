// src/utils/receipt.js
export function printTicket(data, opts = {}) {
  const { venta, items } = data || {}
  const size = (opts.size || '80mm').toLowerCase()  // '58mm' | '80mm' | 'a4'
  const negocio = opts.negocio || {
    nombre: 'Botica Demo',
    ruc: '00000000000',
    direccion: 'Av. Principal 123, Lima',
    telefono: '(01) 000-0000'
  }

  const conf = {
    '58mm': { page: '58mm', body: '50mm', font: '10px', margin: '0' },
    '80mm': { page: '80mm', body: '72mm', font: '11px', margin: '0' },
    'a4':   { page: 'A4',   body: '190mm', font: '12px', margin: '10mm' }
  }[size] || { page: '80mm', body: '72mm', font: '11px', margin: '0' }

  const fmt = new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', minimumFractionDigits:2 })
  const fecha = venta?.fecha ? new Date(venta.fecha) : new Date()
  const f = fecha.toLocaleString('es-PE', { dateStyle:'short', timeStyle:'short' })

  // Filas de items (nombre ajustado a ancho, evita saltos feos)
  const filas = (items || []).map(it => `
    <tr class="row">
      <td class="name">${escapeHtml(it.nombre || '')}</td>
      <td class="qty">${Number(it.cantidad||0)}</td>
      <td class="price">${fmt.format(Number(it.precio_unitario||0))}</td>
      <td class="sub">${fmt.format(Number(it.precio_unitario||0) * Number(it.cantidad||0))}</td>
    </tr>
  `).join('')

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Boleta #${venta?.id || ''}</title>
    <style>
      :root {
        --font: ${conf.font};
        --body-width: ${conf.body};
      }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
      .wrap {
        width: var(--body-width);
        margin: 0 auto;
        padding: ${size === 'a4' ? '8mm' : '6px'};
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        font-size: var(--font);
        line-height: 1.25;
        color: #000;
      }
      h1,h2,h3,p { margin: 0; padding: 0; }
      .center { text-align: center; }
      .muted { color: #444; }
      .hr { border-top: 1px dashed #000; margin: 6px 0; }
      .head .title { font-weight: 700; }
      .table { width: 100%; border-collapse: collapse; }
      .table th, .table td { padding: 4px 0; }
      .table thead th { border-bottom: 1px solid #000; font-weight: 700; }
      .row td { border-bottom: 1px dotted #666; }
      .name { width: 55%; word-break: break-word; }
      .qty { width: 10%; text-align: center; white-space: nowrap; }
      .price { width: 15%; text-align: right; white-space: nowrap; }
      .sub { width: 20%; text-align: right; white-space: nowrap; }
      .tot { text-align: right; font-weight: 700; margin-top: 6px; }
      .cut { border-top: 1px dashed #000; margin: 8px 0; }
      @media print {
        @page { size: ${conf.page} auto; margin: ${conf.margin}; }
        body { margin: 0; }
        .noprint { display: none !important; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head center">
        <div class="title">${escapeHtml(negocio.nombre)}</div>
        <div class="muted">RUC: ${escapeHtml(negocio.ruc)}</div>
        <div class="muted">${escapeHtml(negocio.direccion)}</div>
        <div class="muted">Tel: ${escapeHtml(negocio.telefono)}</div>
      </div>

      <div class="hr"></div>

      <div>
        <div><strong>Boleta:</strong> #${venta?.id || '-'}</div>
        <div><strong>Fecha:</strong> ${f}</div>
        <div><strong>Cliente:</strong> ${escapeHtml(venta?.cliente || '-')}</div>
        <div><strong>DNI:</strong> ${escapeHtml(venta?.dni || '-')}</div>
      </div>

      <div class="hr"></div>

      <table class="table">
        <thead>
          <tr><th class="name">Producto</th><th class="qty">Cant</th><th class="price">P.U.</th><th class="sub">Subt</th></tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>

      <div class="tot">Total: ${fmt.format(Number(venta?.total || 0))}</div>

      <div class="cut"></div>
      <div class="center muted">Gracias por su compra</div>

      <div class="noprint center" style="margin-top:8px;">
        <button onclick="window.print()">Imprimir</button>
      </div>
    </div>
    <script>window.print()</script>
  </body>
  </html>`

  const win = window.open('', '_blank', 'width=820,height=900')
  if(!win){ alert('Permite ventanas emergentes para imprimir el ticket'); return }
  win.document.open()
  win.document.write(html)
  win.document.close()
}

function escapeHtml(s=''){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;')
}
