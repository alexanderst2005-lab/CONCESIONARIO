const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');
code = code.replace("signOut({ callbackUrl: '/' })", "signOut({ callbackUrl: '/login' })");
fs.writeFileSync('src/components/Header.tsx', code);
