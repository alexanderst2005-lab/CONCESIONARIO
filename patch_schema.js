const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');
code = code.replace("color: text('color'),", "color: text('color'),\n\n    accessories: text('accessories'),\n    hasGas: boolean('has_gas').default(false),\n    hasGps: boolean('has_gps').default(false),\n    locationStatus: text('location_status').default('Cita'),");
fs.writeFileSync('src/db/schema.ts', code);
