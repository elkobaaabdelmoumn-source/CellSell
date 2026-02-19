const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const res = await fetch('data/usuarios.json');
    const usuarios = await res.json();
    const admin = usuarios.find(u => u.username === user);

    if (admin && await verifyPassword(pass, admin.passwordHash)) {
      sessionStorage.setItem('adminLogged', 'true');
      window.location.href = 'admin_dashboard.html';
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLogged');
    window.location.href = 'admin.html';
  });
}
// --- CONFIGURA SUPABASE ---
const supabaseUrl = 'TU_PROJECT_URL';  // reemplaza
const supabaseKey = 'TU_ANON_KEY';     // reemplaza
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- LOGIN ADMIN BÁSICO ---
if (!sessionStorage.getItem('adminLogged') && window.location.pathname.includes('admin_dashboard.html')) {
  alert('Debes iniciar sesión');
  window.location.href = 'admin.html';
}

// --- CERRAR SESIÓN ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLogged');
    window.location.href = 'admin.html';
  });
}

// --- CARGAR PEDIDOS ---
async function cargarPedidos() {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById('pedidos-container');
  container.innerHTML = '';

  pedidos.forEach(p => {
    const div = document.createElement('div');
    div.className = 'pedido';
    div.innerHTML = `
      <p><strong>ID:</strong> ${p.id}</p>
      <p><strong>Nombre:</strong> ${p.nombre}</p>
      <p><strong>Dirección:</strong> ${p.direccion}</p>
      <p><strong>Teléfono:</strong> ${p.telefono}</p>
      <p><strong>Total:</strong> ${p.total} €</p>
      <p><strong>Estado:</strong> 
        <select data-id="${p.id}">
          <option value="pendiente" ${p.estado==='pendiente'?'selected':''}>Pendiente</option>
          <option value="procesado" ${p.estado==='procesado'?'selected':''}>Procesado</option>
          <option value="enviado" ${p.estado==='enviado'?'selected':''}>Enviado</option>
          <option value="completado" ${p.estado==='completado'?'selected':''}>Completado</option>
        </select>
      </p>
      <hr>
    `;
    container.appendChild(div);
  });

  // Escuchar cambios de estado
  container.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const estado = e.target.value;
      const { error } = await supabase
        .from('pedidos')
        .update({ estado })
        .eq('id', id);
      if (error) {
        alert('Error al actualizar estado');
        console.error(error);
      } else {
        alert('Estado actualizado');
      }
    });
  });
}

// --- INICIALIZAR DASHBOARD ---
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pedidos-container')) {
    cargarPedidos();
  }
});
// --- CRUD PRODUCTOS ---
const formAgregar = document.getElementById('form-agregar-producto');
const contenedorProductos = document.getElementById('productos-container-admin');

async function cargarProductosAdmin() {
  const res = await fetch('data/productos.json');
  const productos = await res.json();

  contenedorProductos.innerHTML = '';

  productos.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = 'producto-admin';
    div.innerHTML = `
      <p><strong>ID:</strong> ${p.id}</p>
      <p><strong>Nombre:</strong> ${p.nombre}</p>
      <p><strong>Precio:</strong> ${p.precio} €</p>
      <p><strong>Categoría:</strong> ${p.categoria}</p>
      <button onclick="editarProducto(${index})">Editar</button>
      <button onclick="eliminarProducto(${index})">Eliminar</button>
      <hr>
    `;
    contenedorProductos.appendChild(div);
  });
}

// Agregar producto
if (formAgregar) {
  formAgregar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevo = {
      id: Date.now(),
      nombre: document.getElementById('prod-nombre').value,
      descripcion: document.getElementById('prod-descripcion').value,
      precio: parseFloat(document.getElementById('prod-precio').value),
      categoria: document.getElementById('prod-categoria').value,
      etiquetas: document.getElementById('prod-etiquetas').value.split(',').map(t => t.trim()),
      imagen: document.getElementById('prod-imagen').value || "img/producto1.jpg"
    };

    // Leer productos existentes
    const res = await fetch('data/productos.json');
    const productos = await res.json();
    productos.push(nuevo);

    // Guardar en JSON simulando backend
    const blob = new Blob([JSON.stringify(productos, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'productos.json';
    a.click();

    alert('Producto agregado (descarga lista para subir a GitHub)');
    cargarProductosAdmin();
    formAgregar.reset();
  });
}

// Editar producto
window.editarProducto = async function(index) {
  const res = await fetch('data/productos.json');
  const productos = await res.json();
  const p = productos[index];
  const nuevoNombre = prompt("Nombre:", p.nombre);
  const nuevoPrecio = prompt("Precio:", p.precio);
  const nuevaCat = prompt("Categoría:", p.categoria);

  if (nuevoNombre && nuevoPrecio && nuevaCat) {
    p.nombre = nuevoNombre;
    p.precio = parseFloat(nuevoPrecio);
    p.categoria = nuevaCat;

    const blob = new Blob([JSON.stringify(productos, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'productos.json';
    a.click();

    alert('Producto editado (descarga lista para subir a GitHub)');
    cargarProductosAdmin();
  }
}

// Eliminar producto
window.eliminarProducto = async function(index) {
  const res = await fetch('data/productos.json');
  let productos = await res.json();
  if (confirm(`Eliminar ${productos[index].nombre}?`)) {
    productos.splice(index, 1);
    const blob = new Blob([JSON.stringify(productos, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'productos.json';
    a.click();

    alert('Producto eliminado (descarga lista para subir a GitHub)');
    cargarProductosAdmin();
  }
}

// Inicializar carga de productos
window.addEventListener('DOMContentLoaded', () => {
  if (contenedorProductos) {
    cargarProductosAdmin();
  }
});

