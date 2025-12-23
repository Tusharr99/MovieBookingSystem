// backend/hashPassword.js
const bcrypt = require('bcryptjs');

const passwords = ['user123', 'admin123'];

async function hashPasswords() {
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Password: ${password}, Hash: ${hash}`);
  }
}

hashPasswords();
