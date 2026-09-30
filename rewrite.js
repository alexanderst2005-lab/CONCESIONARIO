const fs = require("fs");
let content = fs.readFileSync("src/app/publicar/page.tsx", "utf8");
content = content.replace(/const \[step, setStep\].*;/g, "");
content = content.replace(/const totalSteps = 6;/g, "");
content = content.replace(/const nextStep =.*;/g, "");
content = content.replace(/const prevStep =.*;/g, "");
content = content.replace(/\{step === \d && \(/g, "");
content = content.replace(/<\/div>\s*\)\}/g, "</div>");
fs.writeFileSync("src/app/publicar/page.tsx", content, "utf8");
