/* ---------- FUNCIONALIDADES ---------- */

const CONFIG = {
    whatsapp: '573242847709',
    correo: 'hola@patoblanco.co',
    claveAdmin: 'patoblanco2026'         // AJUSTAR EN EL SERVER
};

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------------- BASE DE DATOS Y ALMACENAMIENTO ---------------- */

const DB = (function () {
    const memoria = {};
    const remoto = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';
    let local = false;
    try { localStorage.setItem('__pb', '1'); localStorage.removeItem('__pb'); local = true; } catch (e) { local = false; }
    return {
        modo: remoto ? 'nube' : (local ? 'navegador' : 'memoria'),
        async leer(clave) {
            if (remoto) { try { const r = await window.storage.get(clave); return r && r.value ? JSON.parse(r.value) : null; } catch (e) { return memoria[clave] ?? null; } }
            if (local) { try { const v = localStorage.getItem(clave); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
            return memoria[clave] ?? null;
        },
        async guardar(clave, valor) {
            memoria[clave] = valor;
            const txt = JSON.stringify(valor);
            if (remoto) { try { await window.storage.set(clave, txt); return true; } catch (e) { return false; } }
            if (local) { try { localStorage.setItem(clave, txt); return true; } catch (e) { return false; } }
            return true;
        }
    };
})();

/* ---------------- SILUETAS ---------------- */

const TINTA = '#001921';
function lienzoSVG(interior) {
    return `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="none" stroke="${TINTA}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${interior}</g></svg>`;
}
const SILUETAS = {
    camiseta: {
        etiqueta: 'Camiseta', caras: 2,
        zonas: { frente: { x: 33, y: 30, w: 34, h: 32 }, espalda: { x: 31, y: 27, w: 38, h: 38 } },
        dibujo: (c, v) => lienzoSVG(`
      <path fill="${c}" d="M118 42 L68 60 L32 108 L74 142 L92 120 L92 288 Q160 300 228 288 L228 120 L246 142 L288 108 L252 60 L202 42 C190 74 130 74 118 42Z"/>
      <path d="M118 42 Q160 ${v === 'frente' ? 88 : 64} 202 42"/>`)
    },

    hoodie: {
        etiqueta: 'Hoodie', caras: 2,
        zonas: { frente: { x: 35, y: 42, w: 30, h: 24 }, espalda: { x: 31, y: 30, w: 38, h: 38 } },
        dibujo: (c, v) => lienzoSVG(`
      <path fill="${c}" d="M116 56 L64 76 L28 124 L72 158 L90 136 L90 290 Q160 302 230 290 L230 136 L248 158 L292 124 L256 76 L204 56Z"/>
      <path fill="${c}" d="M116 56 Q160 126 204 56 Q160 26 116 56Z"/>
      ${v === 'frente'
                ? `<path d="M120 216 L200 216 L214 266 L106 266Z"/><path d="M140 104 L136 158" stroke-width="6"/><path d="M180 104 L184 158" stroke-width="6"/>`
                : `<path d="M116 56 Q160 96 204 56" stroke-width="5"/>`}`)
    },

    chaqueta: {
        etiqueta: 'Chaqueta', caras: 2,
        zonas: { frente: { x: 38, y: 38, w: 22, h: 20 }, espalda: { x: 30, y: 32, w: 40, h: 38 } },
        dibujo: (c, v) => lienzoSVG(`
      <path fill="${c}" d="M114 50 L64 70 L28 118 L72 152 L90 130 L90 288 Q160 298 230 288 L230 130 L248 152 L292 118 L256 70 L206 50Z"/>
      ${v === 'frente'
                ? `<path fill="${c}" d="M114 50 L160 94 L206 50 L186 40 L160 62 L134 40Z"/>
           <path d="M160 94 L160 292" stroke-width="5"/>
           <path d="M110 212 L140 212" stroke-width="6"/><path d="M180 212 L210 212" stroke-width="6"/>`
                : `<path fill="${c}" d="M114 50 Q160 78 206 50 L196 40 L160 58 L124 40Z"/>`}`)
    },

    gorra: {
        etiqueta: 'Gorra', caras: 1,
        zonas: { frente: { x: 35, y: 28, w: 30, h: 24 }, espalda: { x: 35, y: 28, w: 30, h: 24 } },
        dibujo: (c) => lienzoSVG(`
      <path fill="${c}" d="M62 186 C62 98 106 56 160 56 C214 56 258 98 258 186Z"/>
      <path fill="${c}" d="M62 186 C36 190 26 216 44 226 C112 244 212 238 264 210 C276 202 270 186 256 184Z"/>
      <circle fill="${TINTA}" cx="160" cy="60" r="8" stroke="none"/>`)
    },

    pocillo: {
        etiqueta: 'Pocillo', caras: 2,
        zonas: { frente: { x: 27, y: 40, w: 32, h: 32 }, espalda: { x: 27, y: 40, w: 32, h: 32 } },
        dibujo: (c) => lienzoSVG(`
      <path fill="${c}" d="M74 112 L74 236 C74 254 92 264 144 264 C196 264 214 254 214 236 L214 112Z"/>
      <path d="M214 140 C266 134 274 218 214 214" stroke-width="13"/>
      <ellipse fill="${c}" cx="144" cy="112" rx="70" ry="20"/>`)
    },

    termo: {
        etiqueta: 'Termo', caras: 2,
        zonas: { frente: { x: 37, y: 44, w: 26, h: 30 }, espalda: { x: 37, y: 44, w: 26, h: 30 } },
        dibujo: (c) => lienzoSVG(`
      <path fill="${c}" d="M108 98 C108 84 122 78 160 78 C198 78 212 84 212 98 L212 258 C212 272 190 280 160 280 C130 280 108 272 108 258Z"/>
      <path fill="${c}" d="M126 46 L194 46 L194 78 L126 78Z"/>
      <path d="M108 120 L212 120" stroke-width="4"/>`)
    },

    tote: {
        etiqueta: 'Tula', caras: 2,
        zonas: { frente: { x: 32, y: 46, w: 36, h: 30 }, espalda: { x: 32, y: 46, w: 36, h: 30 } },
        dibujo: (c) => lienzoSVG(`
      <path fill="${c}" d="M84 114 L236 114 L250 278 L70 278Z"/>
      <path d="M122 114 C122 62 198 62 198 114" stroke-width="9"/>`)
    }
};

const PALETAS = {
    ropa: [['Blanco', '#FFFFFF'], ['Negro', '#1B1B1B'], ['Naranja', '#FE690B'], ['Gris jaspe', '#B9BDBE'], ['Vino', '#6E1622'], ['Beige', '#E6D8C3']],
    gorra: [['Negro', '#1B1B1B'], ['Blanco', '#FFFFFF'], ['Naranja', '#FE690B'], ['Beige', '#E6D8C3']],
    regalos: [['Blanco', '#FFFFFF'], ['Negro', '#1B1B1B'], ['Naranja', '#FE690B'], ['Acero', '#C9CDCE']],
    tela: [['Crudo', '#EDE3CE'], ['Negro', '#1B1B1B'], ['Blanco', '#FFFFFF']]
};
const TALLAS_ROPA = ['S', 'M', 'L', 'XL', 'XXL'];

const PRODUCTOS_BASE = [
    { id: 'p1', nombre: 'Camiseta clásica', silueta: 'camiseta', categoria: 'ropa', precio: 45000, desc: 'Algodón 180 g, corte unisex', paleta: 'ropa', tallas: TALLAS_ROPA },
    { id: 'p2', nombre: 'Hoodie con capucha', silueta: 'hoodie', categoria: 'ropa', precio: 115000, desc: 'Perchado interior, bolsillo canguro', paleta: 'ropa', tallas: TALLAS_ROPA },
    { id: 'p3', nombre: 'Chaqueta bomber', silueta: 'chaqueta', categoria: 'ropa', precio: 139000, desc: 'Cierre metálico y puño elástico', paleta: 'ropa', tallas: TALLAS_ROPA },
    { id: 'p4', nombre: 'Gorra curva', silueta: 'gorra', categoria: 'accesorios', precio: 38000, desc: 'Seis paneles, broche ajustable', paleta: 'gorra', tallas: ['Única'] },
    { id: 'p5', nombre: 'Pocillo cerámico', silueta: 'pocillo', categoria: 'regalos', precio: 28000, desc: '11 oz, apto para microondas', paleta: 'regalos', tallas: ['Única'] },
    { id: 'p6', nombre: 'Termo de acero', silueta: 'termo', categoria: 'regalos', precio: 59000, desc: '600 ml, doble pared', paleta: 'regalos', tallas: ['Única'] },
    { id: 'p7', nombre: 'Tula de lona', silueta: 'tote', categoria: 'accesorios', precio: 32000, desc: 'Lona cruda reforzada', paleta: 'tela', tallas: ['Única'] }
];

/* ---------------- ESTADO ---------------- */

const estado = {
    productos: [],
    pedidos: [],
    stats: { visitas: 0, dias: {}, producto: {} },
    filtro: 'todo',
    sel: {
        productoId: 'p1', color: ['Blanco', '#FFFFFF'], talla: 'M', vista: 'frente',
        modo: 'imagen', imagen: null, nombreImagen: '', texto: '', fuente: "'Permanent Marker',cursive",
        colorTexto: '#FE690B', escala: 72, pos: 50
    }
};
const productoActual = () => estado.productos.find(p => p.id === estado.sel.productoId) || estado.productos[0];

/* ---------------- INICIAR ---------------- */

(async function iniciar() {
    estado.productos = await DB.leer('pb:productos') || PRODUCTOS_BASE;
    estado.pedidos = await DB.leer('pb:pedidos') || [];
    estado.stats = await DB.leer('pb:stats') || { visitas: 0, dias: {}, producto: {} };
    await registrarVisita();

    pintarCinta();
    pintarFiltros();
    pintarCatalogo();
    pintarOpcionesProducto();
    aplicarProducto(estado.sel.productoId, false);
    conectarEventos();
    $('#anio').textContent = new Date().getFullYear();
    $('#pieWhats').href = `https://wa.me/${CONFIG.whatsapp}`;
    if (location.hash === '#panel') abrirAdmin();
})();

async function registrarVisita() {
    const hoy = new Date().toISOString().slice(0, 10);
    estado.stats.visitas = (estado.stats.visitas || 0) + 1;
    estado.stats.dias = estado.stats.dias || {};
    estado.stats.dias[hoy] = (estado.stats.dias[hoy] || 0) + 1;
    await DB.guardar('pb:stats', estado.stats);
}
async function registrarInteres(id) {
    estado.stats.producto = estado.stats.producto || {};
    estado.stats.producto[id] = (estado.stats.producto[id] || 0) + 1;
    await DB.guardar('pb:stats', estado.stats);
}

/* ---------------- CINTA ---------------- */

function pintarCinta() {
    const frases = ['Estampado en una o mil unidades', 'Bordado · vinilo · sublimación', 'Diseños propios o los tuyos', 'Envíos a toda Colombia', 'Cotización el mismo día'];
    $('#cintaPista').innerHTML = [...frases, ...frases].map(f => `<span>${f} ✦</span>`).join('');
}

/* ---------------- CATALOGO ---------------- */

function pintarFiltros() {
    const cats = ['todo', ...new Set(estado.productos.map(p => p.categoria))];
    const nombres = { todo: 'Todo', ropa: 'Ropa', accesorios: 'Accesorios', regalos: 'Regalos' };
    $('#filtros').innerHTML = cats.map(c =>
        `<button class="chip" data-cat="${c}" aria-pressed="${estado.filtro === c}">${nombres[c] || c}</button>`).join('');
    $$('#filtros .chip').forEach(b => b.addEventListener('click', () => { estado.filtro = b.dataset.cat; pintarFiltros(); pintarCatalogo(); }));
}
function pintarCatalogo() {
    const lista = estado.productos.filter(p => estado.filtro === 'todo' || p.categoria === estado.filtro);
    $('#rejillaCatalogo').innerHTML = lista.map(p => {
        const color = (PALETAS[p.paleta] || PALETAS.ropa)[0][1];
        return `<article class="ficha">
      <div class="ficha__arte">${SILUETAS[p.silueta].dibujo(color, 'frente')}</div>
      <span class="etiqueta">${p.categoria}</span>
      <h3>${p.nombre}</h3>
      <p style="margin:0;font-size:.9rem;color:var(--tinta-80)">${p.desc || ''}</p>
      <div class="ficha__pie">
        <span class="precio">${COP.format(p.precio)}</span>
        <button class="btn btn--sm" data-personalizar="${p.id}">Personalizar</button>
      </div></article>`;
    }).join('');
    $$('[data-personalizar]').forEach(b => b.addEventListener('click', () => {
        aplicarProducto(b.dataset.personalizar);
        $('#taller').scrollIntoView({ behavior: 'smooth' });
    }));
}

/* ---------------- PERSONALIZADOR ---------------- */

function pintarOpcionesProducto() {
    $('#opcionesProducto').innerHTML = estado.productos.map(p =>
        `<button class="opcion" data-prod="${p.id}" aria-pressed="${p.id === estado.sel.productoId}">${p.nombre}</button>`).join('');
    $$('[data-prod]').forEach(b => b.addEventListener('click', () => aplicarProducto(b.dataset.prod)));
}
function aplicarProducto(id, contar = true) {
    const p = estado.productos.find(x => x.id === id) || estado.productos[0];
    estado.sel.productoId = p.id;
    const paleta = PALETAS[p.paleta] || PALETAS.ropa;
    if (!paleta.some(c => c[1] === estado.sel.color[1])) estado.sel.color = paleta[0];
    if (!p.tallas.includes(estado.sel.talla)) estado.sel.talla = p.tallas.includes('M') ? 'M' : p.tallas[0];
    if (SILUETAS[p.silueta].caras === 1) estado.sel.vista = 'frente';
    if (contar) registrarInteres(p.id);
    pintarOpcionesProducto(); pintarColores(); pintarTallas(); pintarLienzo();
}
function pintarColores() {
    const p = productoActual();
    const paleta = PALETAS[p.paleta] || PALETAS.ropa;
    $('#muestrasColor').innerHTML = paleta.map(([n, h]) =>
        `<button class="muestra" style="background:${h}" data-color="${h}" data-nombre="${n}" title="${n}" aria-label="${n}" aria-pressed="${estado.sel.color[1] === h}"></button>`).join('');
    $$('[data-color]').forEach(b => b.addEventListener('click', () => {
        estado.sel.color = [b.dataset.nombre, b.dataset.color]; pintarColores(); pintarLienzo();
    }));
}
function pintarTallas() {
    const p = productoActual();
    $('#campoTalla').classList.toggle('oculto', p.tallas.length <= 1);
    $('#opcionesTalla').innerHTML = p.tallas.map(t =>
        `<button class="opcion" data-talla="${t}" aria-pressed="${estado.sel.talla === t}">${t}</button>`).join('');
    $$('[data-talla]').forEach(b => b.addEventListener('click', () => {
        estado.sel.talla = b.dataset.talla; pintarTallas(); pintarLienzo();
    }));
}
function pintarLienzo() {
    const p = productoActual(), s = SILUETAS[p.silueta], v = estado.sel.vista;
    $('#siluetaHost').innerHTML = s.dibujo(estado.sel.color[1], v);
    $('#conmutadorVista').classList.toggle('oculto', s.caras === 1);
    $$('#conmutadorVista button').forEach(b => b.setAttribute('aria-pressed', b.dataset.vista === v));
    const talla = p.tallas.length > 1 ? ` · Talla ${estado.sel.talla}` : '';
    $('#resumenLienzo').textContent = `${p.nombre} · ${estado.sel.color[0]}${talla}`;

    const z = s.zonas[v], zona = $('#zonaArte');
    Object.assign(zona.style, { left: z.x + '%', top: z.y + '%', width: z.w + '%', height: z.h + '%' });

    const e = estado.sel.escala;
    const desplazar = e >= 100 ? 0 : ((100 - e) * estado.sel.pos / 100) / e * 100;
    const envoltura = `position:absolute;left:50%;top:0;width:${e}%;height:${e}%;display:grid;place-items:center;transform:translateX(-50%) translateY(${desplazar}%)`;

    if (estado.sel.modo === 'imagen' && estado.sel.imagen) {
        zona.innerHTML = `<div style="${envoltura}"><img src="${estado.sel.imagen}" alt="Vista previa del arte"></div>`;
    } else if (estado.sel.modo === 'texto' && estado.sel.texto.trim()) {
        zona.innerHTML = `<div style="${envoltura}"><span class="texto-arte" id="artePreview" style="font-family:${estado.sel.fuente};color:${estado.sel.colorTexto}">${estado.sel.texto.replace(/[<>]/g, '')}</span></div>`;
        requestAnimationFrame(ajustarTexto);
    } else {
        zona.innerHTML = '';
    }
    zona.classList.toggle('zona--guia', !zona.innerHTML);
}
function ajustarTexto() {
    const t = $('#artePreview'); if (!t) return;
    const caja = t.parentElement.getBoundingClientRect();
    const largo = Math.max(estado.sel.texto.trim().length, 4);
    t.style.fontSize = Math.max(9, Math.min(caja.height * 0.62, caja.width * 1.55 / largo)) + 'px';
}
window.addEventListener('resize', () => requestAnimationFrame(ajustarTexto));

/* ---------------- CARGA DE IMAGEN ---------------- */

function leerDataURL(f) { return new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => mal(); r.readAsDataURL(f); }); }
function cargarImagen(src) { return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(); i.src = src; }); }
async function comprimirArte(file) {
    const url = await leerDataURL(file);
    if (file.type === 'image/svg+xml') return url;
    const img = await cargarImagen(url);
    const max = 900; let w = img.width, h = img.height;
    if (Math.max(w, h) > max) { const r = max / Math.max(w, h); w = Math.round(w * r); h = Math.round(h * r); }
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    cv.getContext('2d').drawImage(img, 0, 0, w, h);
    let salida = cv.toDataURL('image/png');
    if (salida.length > 700000) salida = cv.toDataURL('image/jpeg', 0.85);
    return salida;
}
async function recibirArchivo(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return brindis('Ese archivo no es una imagen. Usa PNG, JPG o SVG.');
    if (file.size > 12 * 1024 * 1024) return brindis('La imagen pesa más de 12 MB. Súbela más liviana.');
    try {
        estado.sel.imagen = await comprimirArte(file);
        estado.sel.nombreImagen = file.name;
        $('#nombreArchivo').textContent = `Cargado: ${file.name}`;
        pintarLienzo();
    } catch (e) { brindis('No se pudo leer la imagen. Intenta con otro archivo.'); }
}

/* ---------------- SISTEMA DE EVENTOS ---------------- */

function conectarEventos() {
    $('#menuBtn').addEventListener('click', () => {
        const n = $('#nav'); n.classList.toggle('abierto');
        $('#menuBtn').setAttribute('aria-expanded', n.classList.contains('abierto'));
    });
    $$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('abierto')));

    $$('#conmutadorVista button').forEach(b => b.addEventListener('click', () => { estado.sel.vista = b.dataset.vista; pintarLienzo(); }));
    $$('#conmutadorArte button').forEach(b => b.addEventListener('click', () => {
        estado.sel.modo = b.dataset.modo;
        $$('#conmutadorArte button').forEach(x => x.setAttribute('aria-pressed', x.dataset.modo === estado.sel.modo));
        $('#bloqueImagen').classList.toggle('oculto', estado.sel.modo !== 'imagen');
        $('#bloqueTexto').classList.toggle('oculto', estado.sel.modo !== 'texto');
        pintarLienzo();
    }));

    const soltar = $('#soltar'), input = $('#archivoArte');
    soltar.addEventListener('click', () => input.click());
    soltar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', e => recibirArchivo(e.target.files[0]));
    ['dragenter', 'dragover'].forEach(ev => soltar.addEventListener(ev, e => { e.preventDefault(); soltar.classList.add('activo'); }));
    ['dragleave', 'drop'].forEach(ev => soltar.addEventListener(ev, e => { e.preventDefault(); soltar.classList.remove('activo'); }));
    soltar.addEventListener('drop', e => recibirArchivo(e.dataTransfer.files[0]));

    $('#textoArte').addEventListener('input', e => { estado.sel.texto = e.target.value; pintarLienzo(); });
    $('#fuenteArte').addEventListener('change', e => { estado.sel.fuente = e.target.value; pintarLienzo(); });
    $('#colorTexto').addEventListener('input', e => { estado.sel.colorTexto = e.target.value; pintarLienzo(); });
    $('#escalaArte').addEventListener('input', e => { estado.sel.escala = +e.target.value; pintarLienzo(); });
    $('#posArte').addEventListener('input', e => { estado.sel.pos = +e.target.value; pintarLienzo(); });
    $('#btnEnviar').addEventListener('click', enviarDiseno);

    $('#enlaceAdmin').addEventListener('click', e => { e.preventDefault(); abrirAdmin(); });
    $('#btnEntrar').addEventListener('click', entrarAdmin);
    $('#claveAdmin').addEventListener('keydown', e => { if (e.key === 'Enter') entrarAdmin(); });
    $('#btnVerSitio').addEventListener('click', cerrarAdmin);
    $('#btnSalir').addEventListener('click', () => { sesionAdmin = false; cerrarAdmin(); $('#adminTablero').classList.add('oculto'); $('#adminLogin').classList.remove('oculto'); });
    $$('.tab').forEach(t => t.addEventListener('click', () => {
        $$('.tab').forEach(x => x.setAttribute('aria-selected', x === t));
        $$('[data-panel]').forEach(p => p.classList.toggle('oculto', p.dataset.panel !== t.dataset.tab));
    }));
    $('#btnCrearProducto').addEventListener('click', crearProducto);
    $('#btnCSV').addEventListener('click', exportarCSV);
}

/* ---------------- ENVIO DE PROPUESTA ---------------- */

async function enviarDiseno() {
    const nombre = $('#fNombre').value.trim(), tel = $('#fTel').value.trim();
    if (!nombre || !tel) return brindis('Necesitamos tu nombre y tu WhatsApp para responderte.');
    if (estado.sel.modo === 'imagen' && !estado.sel.imagen) return brindis('Sube la imagen que quieres estampar.');
    if (estado.sel.modo === 'texto' && !estado.sel.texto.trim()) return brindis('Escribe el texto que va estampado.');

    const p = productoActual();
    const pedido = {
        id: 'PB-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        fecha: new Date().toISOString(),
        cliente: nombre, tel, correo: $('#fCorreo').value.trim(),
        cantidad: Math.max(1, +$('#fCantidad').value || 1),
        notas: $('#fNotas').value.trim(),
        producto: { id: p.id, nombre: p.nombre, silueta: p.silueta, precio: p.precio },
        color: estado.sel.color, talla: estado.sel.talla, vista: estado.sel.vista,
        arte: estado.sel.modo === 'imagen'
            ? { tipo: 'imagen', dato: estado.sel.imagen, nombre: estado.sel.nombreImagen }
            : { tipo: 'texto', dato: estado.sel.texto, fuente: estado.sel.fuente, color: estado.sel.colorTexto },
        estadoPedido: 'nuevo'
    };
    estado.pedidos.unshift(pedido);
    aligerarPedidos();
    await DB.guardar('pb:pedidos', estado.pedidos);

    const texto = [
        `Hola Pato Blanco, acabo de enviar un diseño desde la página.`,
        `Código: ${pedido.id}`,
        `Producto: ${p.nombre} · ${estado.sel.color[0]}${p.tallas.length > 1 ? ` · Talla ${estado.sel.talla}` : ''}`,
        `Cantidad: ${pedido.cantidad}`,
        `Arte: ${pedido.arte.tipo === 'imagen' ? 'imagen adjunta' : `texto "${pedido.arte.dato}"`}`,
        pedido.notas ? `Notas: ${pedido.notas}` : ''
    ].filter(Boolean).join('\n');
    const enlace = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

    abrirModal(`
    <h3>Diseño enviado</h3>
    <p>Guardamos tu propuesta con el código <strong>${pedido.id}</strong>. Te escribimos a <strong>${tel}</strong> con el precio final y la fecha de entrega.</p>
    <p class="aviso">Si tu arte es una imagen, mándanosla también por WhatsApp en la mejor calidad que tengas.</p>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.2rem">
      <a class="btn" href="${enlace}" target="_blank" rel="noopener">Continuar por WhatsApp</a>
      <button class="btn btn--claro" data-cerrar type="button">Seguir diseñando</button>
    </div>`);
    $('#fNotas').value = '';
}
function aligerarPedidos() {
    estado.pedidos = estado.pedidos.slice(0, 80);
    const limite = 3_500_000;
    for (let i = estado.pedidos.length - 1; i >= 0 && JSON.stringify(estado.pedidos).length > limite; i--) {
        if (estado.pedidos[i].arte?.tipo === 'imagen' && estado.pedidos[i].arte.dato) {
            estado.pedidos[i].arte.dato = null;
            estado.pedidos[i].arte.liviano = true;
        }
    }
}

/* ---------------- MODAL Y BRINIDS ---------------- */

function abrirModal(html) {
    $('#hostModal').innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal__caja">${html}</div></div>`;
    const cerrar = () => $('#hostModal').innerHTML = '';
    $('#hostModal .modal').addEventListener('click', e => { if (e.target.classList.contains('modal')) cerrar(); });
    $$('#hostModal [data-cerrar]').forEach(b => b.addEventListener('click', cerrar));
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', esc); } });
}
let temporizadorBrindis;
function brindis(msg) {
    clearTimeout(temporizadorBrindis);
    let b = $('#brindis');
    if (!b) { b = document.createElement('div'); b.id = 'brindis'; b.className = 'brindis'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.textContent = msg;
    temporizadorBrindis = setTimeout(() => b.remove(), 3800);
}

/* ---------------- SESION DE ADMIN ---------------- */

let sesionAdmin = false;
function abrirAdmin() {
    $('#admin').classList.remove('oculto');
    $('#admin').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (sesionAdmin) pintarAdmin(); else $('#claveAdmin').focus();
}
function cerrarAdmin() {
    $('#admin').classList.add('oculto');
    $('#admin').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (location.hash === '#panel') history.replaceState(null, '', '#');
}
function entrarAdmin() {
    if ($('#claveAdmin').value !== CONFIG.claveAdmin) { $('#errorClave').textContent = 'Contraseña incorrecta. Verifica e intenta otra vez.'; return; }
    sesionAdmin = true;
    $('#errorClave').textContent = ''; $('#claveAdmin').value = '';
    $('#adminLogin').classList.add('oculto');
    $('#adminTablero').classList.remove('oculto');
    pintarAdmin();
}
function pintarAdmin() { pintarKPIs(); pintarBarras(); pintarTablaPedidos(); pintarTablaProductos(); llenarSelectSiluetas(); }

function pintarKPIs() {
    const hoy = new Date().toISOString().slice(0, 10);
    $('#kpiVisitas').textContent = estado.stats.visitas || 0;
    $('#kpiHoy').textContent = (estado.stats.dias && estado.stats.dias[hoy]) || 0;
    $('#kpiPedidos').textContent = estado.pedidos.length;
    $('#kpiNuevos').textContent = estado.pedidos.filter(p => p.estadoPedido === 'nuevo').length;
}
function pintarBarras() {
    const vistas = estado.stats.producto || {};
    const max = Math.max(1, ...Object.values(vistas));
    $('#barrasProductos').innerHTML = estado.productos.map(p => {
        const v = vistas[p.id] || 0;
        return `<div class="barra__fila"><span>${p.nombre}</span><div class="barra__pista"><div class="barra__valor" style="width:${Math.round(v / max * 100)}%"></div></div><b>${v}</b></div>`;
    }).join('');

    const dias = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dias.push(d.toISOString().slice(0, 10)); }
    const maxD = Math.max(1, ...dias.map(d => (estado.stats.dias || {})[d] || 0));
    $('#barrasDias').innerHTML = dias.map(d => {
        const v = (estado.stats.dias || {})[d] || 0;
        const etiqueta = new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
        return `<div class="barra__fila"><span>${etiqueta}</span><div class="barra__pista"><div class="barra__valor" style="width:${Math.round(v / maxD * 100)}%"></div></div><b>${v}</b></div>`;
    }).join('');
}
function miniaturaPedido(p) {
    if (p.arte.tipo === 'imagen' && p.arte.dato) return `<img class="mini" src="${p.arte.dato}" alt="Arte de ${p.id}">`;
    if (p.arte.tipo === 'texto') return `<div class="mini" style="display:grid;place-items:center;font-family:${p.arte.fuente};color:${p.arte.color};font-size:9px;text-align:center;padding:2px;overflow:hidden">${p.arte.dato}</div>`;
    return `<div class="mini" style="display:grid;place-items:center;font-size:9px">sin arte</div>`;
}
function pintarTablaPedidos() {
    const cuerpo = $('#tablaPedidos tbody');
    $('#vacioPedidos').classList.toggle('oculto', estado.pedidos.length > 0);
    $('#tablaPedidos').classList.toggle('oculto', estado.pedidos.length === 0);
    cuerpo.innerHTML = estado.pedidos.map(p => `
    <tr>
      <td>${miniaturaPedido(p)}</td>
      <td><strong>${p.id}</strong><br><small>${new Date(p.fecha).toLocaleDateString('es-CO')}</small></td>
      <td>${p.cliente}<br><small>${p.tel}${p.correo ? ' · ' + p.correo : ''}</small></td>
      <td>${p.producto.nombre}<br><small>${p.color[0]} · ${p.talla} · ${p.cantidad} und.</small>${p.notas ? `<br><small style="color:var(--fuego)">${p.notas}</small>` : ''}</td>
      <td><select class="estado" data-estado="${p.id}">
        ${['nuevo', 'cotizado', 'en produccion', 'entregado'].map(e => `<option ${p.estadoPedido === e ? 'selected' : ''}>${e}</option>`).join('')}
      </select></td>
      <td><button class="btn btn--sm btn--claro" data-borrar-pedido="${p.id}">Eliminar</button></td>
    </tr>`).join('');

    $$('[data-estado]').forEach(s => s.addEventListener('change', async () => {
        const p = estado.pedidos.find(x => x.id === s.dataset.estado);
        p.estadoPedido = s.value; await DB.guardar('pb:pedidos', estado.pedidos); pintarKPIs();
    }));
    $$('[data-borrar-pedido]').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este pedido? No se puede recuperar.')) return;
        estado.pedidos = estado.pedidos.filter(x => x.id !== b.dataset.borrarPedido);
        await DB.guardar('pb:pedidos', estado.pedidos);
        pintarTablaPedidos(); pintarKPIs();
    }));
}
function llenarSelectSiluetas() {
    $('#npSilueta').innerHTML = Object.entries(SILUETAS).map(([k, v]) => `<option value="${k}">${v.etiqueta}</option>`).join('');
}
async function crearProducto() {
    const nombre = $('#npNombre').value.trim(), precio = +$('#npPrecio').value;
    if (!nombre || !precio) return brindis('Escribe el nombre y el precio del producto.');
    const cat = $('#npCategoria').value;
    const sil = $('#npSilueta').value;
    estado.productos.push({
        id: 'p' + Date.now().toString(36), nombre, precio, categoria: cat, silueta: sil,
        desc: $('#npDesc').value.trim(),
        paleta: sil === 'gorra' ? 'gorra' : sil === 'tote' ? 'tela' : cat === 'regalos' ? 'regalos' : 'ropa',
        tallas: cat === 'ropa' ? TALLAS_ROPA : ['Única']
    });
    await DB.guardar('pb:productos', estado.productos);
    $('#npNombre').value = ''; $('#npPrecio').value = ''; $('#npDesc').value = '';
    pintarTablaProductos(); pintarFiltros(); pintarCatalogo(); pintarOpcionesProducto();
    brindis('Producto guardado y publicado en el catálogo.');
}
function pintarTablaProductos() {
    const vistas = estado.stats.producto || {};
    $('#tablaProductos tbody').innerHTML = estado.productos.map(p => `
    <tr>
      <td style="width:64px">${SILUETAS[p.silueta].dibujo((PALETAS[p.paleta] || PALETAS.ropa)[0][1], 'frente').replace('<svg', '<svg style="width:46px;height:46px"')}</td>
      <td><strong>${p.nombre}</strong><br><small>${p.desc || ''}</small></td>
      <td>${p.categoria}</td>
      <td>${COP.format(p.precio)}</td>
      <td>${vistas[p.id] || 0}</td>
      <td><button class="btn btn--sm btn--claro" data-borrar-prod="${p.id}">Eliminar</button></td>
    </tr>`).join('');
    $$('[data-borrar-prod]').forEach(b => b.addEventListener('click', async () => {
        if (estado.productos.length <= 1) return brindis('Debe quedar al menos un producto en el catálogo.');
        if (!confirm('¿Eliminar este producto del catálogo?')) return;
        estado.productos = estado.productos.filter(x => x.id !== b.dataset.borrarProd);
        await DB.guardar('pb:productos', estado.productos);
        if (!estado.productos.some(x => x.id === estado.sel.productoId)) aplicarProducto(estado.productos[0].id, false);
        pintarTablaProductos(); pintarFiltros(); pintarCatalogo(); pintarOpcionesProducto();
    }));
}
function exportarCSV() {
    if (!estado.pedidos.length) return brindis('Todavía no hay pedidos para exportar.');
    const cab = ['codigo', 'fecha', 'cliente', 'telefono', 'correo', 'producto', 'color', 'talla', 'cantidad', 'tipo_arte', 'detalle_arte', 'notas', 'estado'];
    const filas = estado.pedidos.map(p => [
        p.id, p.fecha, p.cliente, p.tel, p.correo || '', p.producto.nombre, p.color[0], p.talla, p.cantidad,
        p.arte.tipo, p.arte.tipo === 'texto' ? p.arte.dato : (p.arte.nombre || 'imagen'), p.notas || '', p.estadoPedido
    ]);
    const csv = '\uFEFF' + [cab, ...filas].map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos-pato-blanco-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}