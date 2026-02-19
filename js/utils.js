// Función para verificar contraseña con hash
async function verifyPassword(plain, hash) {
  const { default: bcrypt } = await import('https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js');
  return bcrypt.compareSync(plain, hash);
}
