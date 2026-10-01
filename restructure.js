const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/app/admin');
const protectedDir = path.join(adminDir, '(protected)');

if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir, { recursive: true });
}

const itemsToMove = [
  'categorias', 'leads', 'marcas', 'usuarios', 'vehiculos',
  'AdminSidebar.tsx', 'AdminSidebar.module.css',
  'layout.tsx', 'layout.module.css',
  'page.tsx', 'page.module.css',
  'actions.ts'
];

for (const item of itemsToMove) {
  const oldPath = path.join(adminDir, item);
  const newPath = path.join(protectedDir, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
}

// Rename admin-login back to admin/login
const loginDir = path.join(adminDir, 'login');
if (!fs.existsSync(loginDir)) {
  fs.mkdirSync(loginDir, { recursive: true });
}

const oldLoginPath = path.join(__dirname, 'src/app/admin-login/page.tsx');
if (fs.existsSync(oldLoginPath)) {
  fs.renameSync(oldLoginPath, path.join(loginDir, 'page.tsx'));
}

console.log("Restructuring complete!");
