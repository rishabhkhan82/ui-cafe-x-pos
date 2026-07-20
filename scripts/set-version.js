const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

const versionFile = path.join(__dirname, '..', 'src', 'app', 'version.ts');
const content = `// Auto-generated at build time. Do not edit manually.\nexport const APP_VERSION = '${version}';\n`;

fs.writeFileSync(versionFile, content);
console.log(`App version set to: ${version}`);
