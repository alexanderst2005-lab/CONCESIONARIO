const fs = require('fs');

function patchFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  if (code.includes('onClick={() => signIn(')) {
     console.log('Already patched', path);
     return;
  }
  code = code.replace(
    /<button className=\{\`btn-secondary \$\{styles\.googleBtn\}\`\}>/,
    '<button type="button" className={`btn-secondary ${styles.googleBtn}`} onClick={() => signIn(\'google\', { callbackUrl: \'/mi-cuenta\' })}>'
  );
  if (!code.includes('import { signIn }')) {
    code = code.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { signIn } from "next-auth/react";');
  }
  fs.writeFileSync(path, code);
  console.log('Patched', path);
}

patchFile('src/app/(public)/login/page.tsx');
patchFile('src/app/(public)/registro/page.tsx');
