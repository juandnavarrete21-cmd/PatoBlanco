/* =========================================================================
   PATO BLANCO · página de inicio
   Necesita datos.js cargado antes. El taller vive en taller.html / taller.js
   ========================================================================= */

/* ---------------- INICIAR ---------------- */

(async function iniciar() {
    await cargarDatos();
    await registrarVisita();

    pintarCinta();
    pintarFiltros();
    pintarCatalogo();
    conectarNav();
    conectarPie();
    conectarEventos();
    if (location.hash === '#panel') abrirAdmin();
})();

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
        <a class="btn btn--sm btn--externo" href="${enlaceTaller(p.id)}" target="_blank" rel="noopener"
           aria-label="Diseñar ${p.nombre} en el taller (abre en una pestaña nueva)">Diseñar</a>
      </div></article>`;
    }).join('');
}

/* ---------------- SISTEMA DE EVENTOS ---------------- */

function conectarEventos() {
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
    pintarTablaProductos(); pintarFiltros(); pintarCatalogo();
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
        pintarTablaProductos(); pintarFiltros(); pintarCatalogo();
    }));
}
function exportarCSV() {
    if (!estado.pedidos.length) return brindis('Todavía no hay pedidos para exportar.');
    const cab = ['codigo', 'fecha', 'cliente', 'telefono', 'correo', 'producto', 'color', 'talla', 'cantidad', 'tipo_arte', 'detalle_arte', 'notas', 'estado'];
    const filas = estado.pedidos.map(p => [
        p.id, p.fecha, p.cliente, p.tel, p.correo || '', p.producto.nombre, p.color[0], p.talla, p.cantidad,
        p.arte.tipo, p.arte.tipo === 'texto' ? p.arte.dato : (p.arte.nombre || 'imagen'), p.notas || '', p.estadoPedido
    ]);
    const csv = '﻿' + [cab, ...filas].map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos-pato-blanco-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/* ---------------- INTRO DE ENTRADA ---------------- */

const INTRO = {
    sprite: 'assets/iconografia/pato-sprite.png',
    unaVezPorSesion: true,      // ponlo en false para verlo en cada recarga
    correr: 1250,               // duración de cada fase, en milisegundos
    salto: 540,
    caida: 280,
    reposo: 620,
    salida: 520
};

function introYaVisto() {
    try { return sessionStorage.getItem('pb:intro') === '1'; } catch (e) { return false; }
}
function marcarIntroVisto() {
    try { sessionStorage.setItem('pb:intro', '1'); } catch (e) { /* modo privado */ }
}

function precargarSprite(ruta) {
    return new Promise(listo => {
        const img = new Image();
        img.onload = img.onerror = listo;
        img.src = ruta;
        if (img.complete) listo();
        setTimeout(listo, 1200);            // si la red se demora, arrancamos igual
    });
}

function montarIntro() {
    const caja = document.createElement('div');
    caja.className = 'pbi';
    caja.setAttribute('role', 'presentation');
    caja.innerHTML = `
    <div class="pbi__escena">
      <p class="pbi__marca"><span>Pato</span><span>Blanco</span></p>
      <div class="pbi__pato"><div class="pbi__salto"><div class="pbi__sprite"></div></div></div>
      <p class="pbi__lema">Personalización</p>
    </div>
    <button class="pbi__saltar" type="button">Saltar</button>`;
    caja.style.setProperty('--pb-t-correr', INTRO.correr + 'ms');
    caja.style.setProperty('--pb-t-salto', INTRO.salto + 'ms');
    caja.style.setProperty('--pb-t-caida', INTRO.caida + 'ms');
    caja.style.setProperty('--pb-t-salida', INTRO.salida + 'ms');
    document.body.appendChild(caja);
    return caja;
}

async function reproducirIntro() {
    if (INTRO.unaVezPorSesion && introYaVisto()) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { marcarIntroVisto(); return; }
    marcarIntroVisto();

    const caja = montarIntro();
    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let terminado = false;

    const cerrar = async () => {
        if (terminado) return;
        terminado = true;
        caja.removeEventListener('click', saltar);
        document.removeEventListener('keydown', saltar);
        caja.classList.add('pbi--fin');
        await esperar(INTRO.salida);
        caja.remove();
        document.body.style.overflow = scrollPrevio;
    };
    const saltar = e => { if (e.type === 'keydown' && e.key !== 'Escape') return; cerrar(); };
    caja.addEventListener('click', saltar);
    document.addEventListener('keydown', saltar);

    const fase = async (clase, ms) => {
        if (terminado) return;
        caja.className = 'pbi ' + clase;
        await esperar(ms);
    };

    await precargarSprite(INTRO.sprite);
    await fase('pbi--corre', INTRO.correr);
    await fase('pbi--salta', INTRO.salto);
    await fase('pbi--cae', INTRO.caida);
    await fase('pbi--listo', INTRO.reposo);
    await cerrar();
}

reproducirIntro();
