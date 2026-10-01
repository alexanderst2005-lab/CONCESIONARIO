const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('getServerSession()') && content.includes('next-auth/next')) {
    if (!content.includes('authOptions')) {
      content = content.replace(
        /import \{ getServerSession \} from "next-auth\/next";/,
        'import { getServerSession } from "next-auth/next";\nimport { authOptions } from "@/app/api/auth/[...nextauth]/route";'
      );
    }
    content = content.replace(/getServerSession\(\)/g, 'getServerSession(authOptions)');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('route.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src/app/api/admin'));
