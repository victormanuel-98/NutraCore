const fs = require('fs');
const path = require('path');
const buildOpenApiSpec = require('../docs/openapi');

const outputPath = path.join(__dirname, '..', 'docs', 'openapi.generated.json');
fs.writeFileSync(outputPath, `${JSON.stringify(buildOpenApiSpec(), null, 2)}\n`, 'utf8');
console.log(`OpenAPI exportado en ${outputPath}`);
