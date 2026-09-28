
/* ---------------- INICIAR ---------------- */

(async function iniciarTaller() {
    await cargarDatos();

    const pedido = new URLSearchParams(location.search).get('producto');
    const inicial = estado.productos.some(p => p.id === pedido) ? pedido : estado.productos[0].id;

    pintarOpcionesProducto();
    aplicarProducto(inicial);
    conectarNav();
    conectarPie();
    conectarEventosTaller();
})();

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
    if ($('#precioTaller')) $('#precioTaller').textContent = COP.format(p.precio);

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

function conectarEventosTaller() {
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
