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

