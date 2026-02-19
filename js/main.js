// --- CONFIGURA TU SUPABASE ---
const supabaseUrl = 'TU_PROJECT_URL';  https://xbabdsgpzhdbrvvypcsw.supabase.co
const supabaseKey = 'TU_ANON_KEY';     sb_publishable_z1tCWojSymvrg-xTSEXWzw_1Gw-OYuL
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- FUNCIONES DEL CARRITO ---
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('carrito') || '[]');
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Agregar producto al carrito
function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const index = carrito.findIndex(p => p.id === producto.id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    producto.cantidad = 1;
    carrito.push(producto);
  }
  guardarCarrito(carrito);
  alert(`${producto.nombre} agregado al carrito`);
}

// Calcular total
function calcularTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
}

// --- FUNCIONES DE PRODUCTOS ---
async function cargarProductos() {
  const res = await fetch('data/productos.json');
  const productos = await res.json();
  const contenedor = document.getElementById('productos-container');

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" width="150">
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <strong>${producto.precio} €</strong>
      <button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>
    `;
    contenedor.appendChild(div);
  });
}

// --- FUNCIONES DE PEDIDOS (SUPABASE) ---
async function guardarPedido(pedido) {
  const { data, error } = await supabase
    .from('pedidos')
    .insert([pedido]);

  if (error) {
    alert("Error al guardar pedido");
    console.error(error);
  } else {
    alert("Pedido enviado correctamente");
    localStorage.removeItem("carrito");
    window.location.href = 'index.html';
  }
}

// --- CHECKOUT ---
function initCheckout() {
  const btnComprar = document.getElementById('btn-comprar');
  if (!btnComprar) return;

  btnComprar.addEventListener('click', () => {
    const nombre = prompt("Nombre completo:");
    const direccion = prompt("Dirección de entrega:");
    const telefono = prompt("Teléfono:");

    if (!nombre || !direccion || !telefono) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    const pedido = {
      nombre,
      direccion,
      telefono,
      productos: carrito,
      total: calcularTotal(),
      estado: "pendiente"
    };

    guardarPedido(pedido);
  });
}

// --- INICIALIZAR ---
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productos-container')) {
    cargarProductos();
  }
  // --- CARGAR PRODUCTOS DESDE SUPABASE ---
async function cargarProductos() {
  const contenedor = document.getElementById('productos-container');
  if (!contenedor) return;

  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return console.error('Error al cargar productos:', error);

  contenedor.innerHTML = '';

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <img src="${producto.imagen || 'img/producto1.jpg'}" alt="${producto.nombre}" width="150">
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <strong>${producto.precio} €</strong>
      <button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>
    `;
    contenedor.appendChild(div);
  });
}

  if (document.getElementById('btn-comprar')) {
    initCheckout();
  }
});

