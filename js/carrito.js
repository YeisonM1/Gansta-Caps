/* =======================================================
   SISTEMA DE CARRITO DE COMPRAS
   Maneja agregar productos, localStorage, modal y WhatsApp
   ======================================================= */

// CONFIGURACIÓN PRINCIPAL
const WHATSAPP_NUMBER = "573007274969"; // Tu número de WhatsApp (sin +)
const CARRITO_STORAGE_KEY = "gansta_caps_carrito"; // Clave para localStorage

// VARIABLES GLOBALES - Elementos del DOM
let carritoFlotante, carritoIndicator, carritoContador, carritoTotal;
let carritoModal, modalOverlay, modalClose, carritoItems, carritoSummaryTotal;
let enviarWhatsAppBtn, limpiarCarritoBtn;

// ARRAY QUE GUARDA LOS PRODUCTOS DEL CARRITO
let carrito = [];

/* =======================================================
   INICIALIZACIÓN - Se ejecuta cuando carga la página
   ======================================================= */
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a todos los elementos del DOM
    initializeElements();
    
    // Cargar carrito guardado del navegador
    cargarCarritoDelStorage();
    
    // Configurar todos los eventos (clicks, etc.)
    setupEventListeners();
    
    // Actualizar la interfaz con los datos cargados
    actualizarInterfaz();
});

/* =======================================================
   OBTENER ELEMENTOS DEL DOM
   ======================================================= */
function initializeElements() {
    // Elementos del carrito flotante
    carritoFlotante = document.getElementById('carritoFlotante');
    carritoIndicator = document.getElementById('carritoIndicator');
    carritoContador = document.getElementById('carritoContador');
    carritoTotal = document.getElementById('carritoTotal');
    
    // Elementos del modal
    carritoModal = document.getElementById('carritoModal');
    modalOverlay = document.getElementById('modalOverlay');
    modalClose = document.getElementById('modalClose');
    carritoItems = document.getElementById('carritoItems');
    carritoSummaryTotal = document.getElementById('carritoSummaryTotal');
    
    // Botones de acción
    enviarWhatsAppBtn = document.getElementById('enviarWhatsApp');
    limpiarCarritoBtn = document.getElementById('limpiarCarrito');
}

/* =======================================================
   CONFIGURAR EVENTOS (CLICKS, ETC.)
   ======================================================= */
function setupEventListeners() {
    // BOTONES "AGREGAR AL CARRITO" EN CADA PRODUCTO
    const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarProducto);
    });
    
    // ABRIR MODAL AL HACER CLICK EN CARRITO FLOTANTE
    if (carritoIndicator) {
        carritoIndicator.addEventListener('click', abrirModal);
    }
    
    // CERRAR MODAL
    if (modalClose) {
        modalClose.addEventListener('click', cerrarModal);
    }
    
    // CERRAR MODAL AL HACER CLICK EN EL FONDO OSCURO
    if (modalOverlay) {
        modalOverlay.addEventListener('click', cerrarModal);
    }
    
    // ENVIAR PEDIDO POR WHATSAPP
    if (enviarWhatsAppBtn) {
        enviarWhatsAppBtn.addEventListener('click', enviarPorWhatsApp);
    }
    
    // LIMPIAR CARRITO COMPLETO
    if (limpiarCarritoBtn) {
        limpiarCarritoBtn.addEventListener('click', limpiarCarrito);
    }
    
    // CERRAR MODAL CON TECLA ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && carritoModal.classList.contains('show')) {
            cerrarModal();
        }
    });
}

/* =======================================================
   AGREGAR PRODUCTO AL CARRITO
   ======================================================= */
function agregarProducto(e) {
    // Obtener datos del producto desde los atributos data-*
    const boton = e.target;
    const nombre = boton.getAttribute('data-name');
    const precio = parseInt(boton.getAttribute('data-price'));
    const imagen = boton.getAttribute('data-image');
    
    // Verificar que todos los datos estén presentes
    if (!nombre || !precio || !imagen) {
        console.error('Datos del producto incompletos');
        return;
    }
    
    // Crear objeto del producto
    const producto = {
        id: generarId(nombre), // ID único basado en el nombre
        nombre: nombre,
        precio: precio,
        imagen: imagen,
        cantidad: 1
    };
    
    // Buscar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        // Si ya existe, aumentar cantidad
        productoExistente.cantidad += 1;
    } else {
        // Si no existe, agregar nuevo producto
        carrito.push(producto);
    }
    
    // Guardar en localStorage y actualizar interfaz
    guardarCarritoEnStorage();
    actualizarInterfaz();
    mostrarFeedbackBoton(boton);
    
    console.log('Producto agregado:', producto);
}

/* =======================================================
   GENERAR ID ÚNICO PARA PRODUCTOS
   ======================================================= */
function generarId(nombre) {
    // Convertir nombre a ID: "Los Angeles Dodgers" → "los_angeles_dodgers"
    return nombre.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

/* =======================================================
   FEEDBACK VISUAL AL AGREGAR PRODUCTO
   ======================================================= */
function mostrarFeedbackBoton(boton) {
    const textoOriginal = boton.textContent;
    
    // Cambiar texto y color temporalmente
    boton.textContent = '✓ Agregado';
    boton.classList.add('agregado');
    
    // Restaurar después de 1 segundo
    setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.classList.remove('agregado');
    }, 1000);
}

/* =======================================================
   ACTUALIZAR INTERFAZ (CONTADORES, TOTALES, ETC.)
   ======================================================= */
function actualizarInterfaz() {
    const totalProductos = calcularTotalProductos();
    const totalPrecio = calcularTotalPrecio();
    
    // Mostrar/ocultar carrito flotante según si hay productos
    if (totalProductos > 0) {
        if (carritoFlotante) carritoFlotante.style.display = 'block';
    } else {
        if (carritoFlotante) carritoFlotante.style.display = 'none';
    }
    
    // Actualizar contador de productos
    if (carritoContador) {
        carritoContador.textContent = totalProductos;
    }
    
    // Actualizar total de precio
    if (carritoTotal) {
        carritoTotal.textContent = formatearPrecio(totalPrecio);
    }
    
    // Actualizar total en el modal
    if (carritoSummaryTotal) {
        carritoSummaryTotal.textContent = formatearPrecio(totalPrecio);
    }
    
    // Actualizar lista de productos en el modal
    actualizarListaProductos();
}

/* =======================================================
   CALCULAR TOTALES
   ======================================================= */
function calcularTotalProductos() {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

function calcularTotalPrecio() {
    return carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
}

/* =======================================================
   FORMATEAR PRECIO PARA MOSTRAR
   ======================================================= */
function formatearPrecio(precio) {
    return `$${precio.toLocaleString('es-CO')}`;
}

/* =======================================================
   ACTUALIZAR LISTA DE PRODUCTOS EN EL MODAL
   ======================================================= */
function actualizarListaProductos() {
    if (!carritoItems) return;
    
    // Limpiar contenido actual
    carritoItems.innerHTML = '';
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Tu carrito está vacío</p>';
        return;
    }
    
    // Crear elemento HTML para cada producto
    carrito.forEach(producto => {
        const productoHTML = crearElementoProducto(producto);
        carritoItems.appendChild(productoHTML);
    });
}

/* =======================================================
   CREAR ELEMENTO HTML PARA UN PRODUCTO EN EL MODAL
   ======================================================= */
function crearElementoProducto(producto) {
    const div = document.createElement('div');
    div.className = 'carrito-item';
    div.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-item-image">
        <div class="carrito-item-info">
            <div class="carrito-item-name">${producto.nombre}</div>
            <div class="carrito-item-price">${formatearPrecio(producto.precio)} c/u</div>
        </div>
        <div class="carrito-item-controls">
            <button class="cantidad-btn" onclick="cambiarCantidad('${producto.id}', -1)">-</button>
            <span class="cantidad-display">${producto.cantidad}</span>
            <button class="cantidad-btn" onclick="cambiarCantidad('${producto.id}', 1)">+</button>
            <button class="eliminar-item" onclick="eliminarProducto('${producto.id}')">Eliminar</button>
        </div>
    `;
    return div;
}

/* =======================================================
   CAMBIAR CANTIDAD DE UN PRODUCTO
   ======================================================= */
function cambiarCantidad(productoId, cambio) {
    const producto = carrito.find(item => item.id === productoId);
    
    if (producto) {
        producto.cantidad += cambio;
        
        // Si la cantidad llega a 0, eliminar producto
        if (producto.cantidad <= 0) {
            eliminarProducto(productoId);
            return;
        }
        
        // Guardar y actualizar
        guardarCarritoEnStorage();
        actualizarInterfaz();
    }
}

/* =======================================================
   ELIMINAR PRODUCTO INDIVIDUAL
   ======================================================= */
function eliminarProducto(productoId) {
    // Filtrar el array para quitar el producto
    carrito = carrito.filter(item => item.id !== productoId);
    
    // Guardar y actualizar
    guardarCarritoEnStorage();
    actualizarInterfaz();
    
    // Si no quedan productos, cerrar modal
    if (carrito.length === 0) {
        cerrarModal();
    }
}

/* =======================================================
   LIMPIAR TODO EL CARRITO
   ======================================================= */
function limpiarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
        carrito = [];
        guardarCarritoEnStorage();
        actualizarInterfaz();
        cerrarModal();
    }
}

/* =======================================================
   ABRIR Y CERRAR MODAL
   ======================================================= */
function abrirModal() {
    if (carritoModal) {
        carritoModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Evitar scroll del body
    }
}

function cerrarModal() {
    if (carritoModal) {
        carritoModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaurar scroll del body
    }
}

/* =======================================================
   ENVIAR PEDIDO POR WHATSAPP - VERSIÓN CORREGIDA
   ======================================================= */
function enviarPorWhatsApp() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // VERSIÓN SIMPLE SIN EMOJIS (más compatible)
    let mensaje = "NUEVO PEDIDO - GANSTA CAPS\n\n";
    
    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        // Limpiar nombre de caracteres problemáticos
        const nombreLimpio = limpiarTexto(producto.nombre);
        mensaje += `${nombreLimpio}\n`;
        mensaje += `${formatearPrecioSimple(producto.precio)} x ${producto.cantidad} = ${formatearPrecioSimple(subtotal)}\n\n`;
    });
    
    const total = calcularTotalPrecio();
    mensaje += `TOTAL: ${formatearPrecioSimple(total)}\n\n`;
    mensaje += "Gracias por tu pedido!";
    
    // DEBUG: Ver mensaje en consola antes de enviarlo
    console.log('Mensaje a enviar:', mensaje);
    console.log('Longitud del mensaje:', mensaje.length);
    
    // Verificar longitud del mensaje
    if (mensaje.length > 1500) {
        enviarMensajeCorto();
        return;
    }
    
    // Codificación más segura
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
    
    // DEBUG: Ver URL completa
    console.log('URL WhatsApp:', urlWhatsApp);
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank');
}

/* =======================================================
   FUNCIONES AUXILIARES PARA LIMPIAR TEXTO
   ======================================================= */
function limpiarTexto(texto) {
    return texto
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-zA-Z0-9\s]/g, ' ') // Quitar caracteres especiales
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();
}

function formatearPrecioSimple(precio) {
    // Sin símbolos problemáticos, solo números
    return precio.toLocaleString('es-CO');
}

/* =======================================================
   MENSAJE CORTO SI EL PEDIDO ES MUY GRANDE
   ======================================================= */
function enviarMensajeCorto() {
    const totalProductos = calcularTotalProductos();
    const totalPrecio = calcularTotalPrecio();
    
    let mensaje = `NUEVO PEDIDO - GANSTA CAPS\n\n`;
    mensaje += `${totalProductos} productos\n`;
    mensaje += `Total: ${formatearPrecioSimple(totalPrecio)}\n\n`;
    mensaje += `Te enviare los detalles por aqui!`;
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
    
    window.open(urlWhatsApp, '_blank');
}

/* =======================================================
   LOCALSTORAGE - GUARDAR Y CARGAR CARRITO
   ======================================================= */
function guardarCarritoEnStorage() {
    try {
        localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    } catch (error) {
        console.error('Error al guardar carrito:', error);
    }
}

function cargarCarritoDelStorage() {
    try {
        const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }
    } catch (error) {
        console.error('Error al cargar carrito:', error);
        carrito = []; // Resetear si hay error
    }
}

/* =======================================================
   FUNCIÓN DE PRUEBA SIMPLE
   Usar esta primero para verificar que WhatsApp funciona
   ======================================================= */
function probarWhatsApp() {
    const mensajePrueba = "Hola, estoy probando el carrito de Gansta Caps";
    const mensajeCodificado = encodeURIComponent(mensajePrueba);
    const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
    
    console.log('Probando WhatsApp:', urlWhatsApp);
    window.open(urlWhatsApp, '_blank');
}

/* =======================================================
   ALTERNATIVA: COPIAR MENSAJE AL PORTAPAPELES
   Si WhatsApp sigue fallando
   ======================================================= */
async function copiarMensaje() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    let mensaje = "NUEVO PEDIDO - GANSTA CAPS\n\n";
    
    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        mensaje += `${producto.nombre}\n`;
        mensaje += `$${producto.precio.toLocaleString()} x ${producto.cantidad} = $${subtotal.toLocaleString()}\n\n`;
    });
    
    const total = calcularTotalPrecio();
    mensaje += `TOTAL: $${total.toLocaleString()}\n\n`;
    mensaje += "Gracias por tu pedido!";
    
    try {
        await navigator.clipboard.writeText(mensaje);
        alert('Mensaje copiado! Pégalo manualmente en WhatsApp');
    } catch (error) {
        console.error('Error al copiar:', error);
        // Mostrar mensaje en un alert como fallback
        alert('Copia este mensaje:\n\n' + mensaje);
    }
}

/* =======================================================
   DEBUG - FUNCIONES PARA PRUEBAS (BORRAR EN PRODUCCIÓN)
   ======================================================= */
function verCarrito() {
    console.log('Carrito actual:', carrito);
    console.log('Total productos:', calcularTotalProductos());
    console.log('Total precio:', formatearPrecio(calcularTotalPrecio()));
}

function borrarStorageCarrito() {
    localStorage.removeItem(CARRITO_STORAGE_KEY);
    carrito = [];
    actualizarInterfaz();
    console.log('Carrito borrado del storage');
}

// Para usar en consola del navegador:
// verCarrito() - Ver contenido actual
// borrarStorageCarrito() - Limpiar todo
// probarWhatsApp() - Probar si WhatsApp funciona básico