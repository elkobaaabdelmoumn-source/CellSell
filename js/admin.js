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

