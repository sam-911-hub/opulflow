const fs = require('fs');
const ts = require('typescript');
const src = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
try {
  const res = ts.transpileModule(src, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });
  console.log('ok');
} catch (err) {
  console.error(err);
  process.exit(1);
}
