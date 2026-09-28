
const CONFIG = {
    whatsapp: '573242847709',
    correo: 'hola@patoblanco.co',
    claveAdmin: 'patoblanco2026'         // AJUSTAR EN EL SERVER
};

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esperar = ms => new Promise(listo => setTimeout(listo, ms));

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

/* ---------------- FOTOS DEL CATALOGO ------------------- */

const FOTOS = {
    carpeta: 'assets/catalogo/',
    ext: '.jpg',                 
    hoodies: [
        'hoodies/hoodie-santafe-frente',
        'hoodies/hoodie-santafe-espalda',
        'hoodies/hoodie-stranger-things-frente',
        'hoodies/hoodie-a-marte-frente',
        'hoodies/hoodie-a-marte-espalda',
        'hoodies/hoodie-alas-espalda',
        'hoodies/hoodie-ktm-frente',
        'hoodies/hoodie-yamaha-frente',
        'hoodies/hoodie-yamaha-mt07-espalda',
        'hoodies/hoodie-fox-neon-espalda',
        'hoodies/hoodie-fox-monster-espalda',
        'hoodies/hoodie-fox-racing-espalda',
        'hoodies/hoodie-redbull-espalda'
    ]
};

/* LISTA DE OBJETOS DE CATALOGO */

function galeriaDe(lista, prefijo) {
    if (!lista || !lista.length) return [];
    return lista.map((archivo, i) => ({
        src: FOTOS.carpeta + archivo + FOTOS.ext,
        codigo: prefijo + String(i + 1).padStart(2, '0')
    }));
}

const PRODUCTOS_BASE = [
    { id: 'p1', nombre: 'Camiseta clásica', silueta: 'camiseta', categoria: 'ropa', precio: 45000, desc: 'Algodón 180 g, corte unisex', paleta: 'ropa', tallas: TALLAS_ROPA },
    { id: 'p2', nombre: 'Hoodie con capucha', silueta: 'hoodie', categoria: 'ropa', precio: 115000, desc: 'Perchado interior, bolsillo canguro', paleta: 'ropa', tallas: TALLAS_ROPA, fotos: galeriaDe(FOTOS.hoodies, 'H') },
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

/* CARGAR DATOS GUARDADOS */

async function cargarDatos() {
    estado.productos = await DB.leer('pb:productos') || PRODUCTOS_BASE;
    estado.pedidos = await DB.leer('pb:pedidos') || [];
    estado.stats = await DB.leer('pb:stats') || { visitas: 0, dias: {}, producto: {} };
}

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

/* ---------------- PIEZAS DE INTERFAZ COMPARTIDAS ---------------- */

/* Menú de la cabecera. Igual en las dos páginas. */
function conectarNav() {
    const boton = $('#menuBtn'), nav = $('#nav');
    if (!boton || !nav) return;
    boton.addEventListener('click', () => {
        nav.classList.toggle('abierto');
        boton.setAttribute('aria-expanded', nav.classList.contains('abierto'));
    });
    $$('#nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('abierto')));
}

/* PIE DE PAGINA Y ENLACE DE WhatsApp. */

function conectarPie() {
    if ($('#anio')) $('#anio').textContent = new Date().getFullYear();
    if ($('#pieWhats')) $('#pieWhats').href = `https://wa.me/${CONFIG.whatsapp}`;
}

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

/* RUTAS DE LAS PÁGINAS Y UBICACIONES */

const RUTAS = {
    inicio: 'index.html',
    taller: 'src/WorkShop.html'      // index.html
};

/* ENLACE AL TALLER: src/WorkShop.html?producto=p2 */

function enlaceTaller(idProducto) {
    return idProducto ? `${RUTAS.taller}?producto=${encodeURIComponent(idProducto)}` : RUTAS.taller;
}

/* ENLACE DE WHATSAPP CON EL PRODUCTO VISTO */

function enlaceWhatsApp(nombreProducto, codigo) {
    const texto = `Hola Pato Blanco, vi este diseño en el catálogo y me interesa.\nProducto: ${nombreProducto}\nReferencia: ${codigo}`;
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}
