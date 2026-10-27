const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// El mismo perfil se hereda durante la generación BDD y la ejecución de Playwright.
const [perfil, comando, ...argumentos] = process.argv.slice(2);
const raiz = path.resolve(__dirname, '../..');
const scripts = require(path.join(raiz, 'package.json')).scripts;
if (!perfil || !/^[a-z][a-z0-9-]*$/.test(perfil) || !fs.existsSync(path.join(raiz, 'Workspace/Profiles', `${perfil}.json`))) {
  console.error('Indica un perfil existente. Ejemplo: pnpm ambiente qa test:bdd:smoke --list');
  process.exit(1);
}
if (!comando || comando === 'ambiente' || !Object.hasOwn(scripts, comando)) {
  console.error('Indica un script del proyecto. Ejemplo: pnpm ambiente prod test:smoke');
  process.exit(1);
}
console.log(`Perfil: ${perfil} | Comando: ${comando}`);
// Node ejecuta pnpm directamente para conservar argumentos y códigos de salida en Windows.
const resultado = spawnSync(process.execPath, [process.env.npm_execpath, 'run', comando, ...argumentos], {
  cwd: raiz, stdio: 'inherit', env: { ...process.env, TEST_PROFILE: perfil },
});
if (resultado.error) console.error(resultado.error.message);
process.exit(resultado.status ?? 1);
