const fs = require('fs');
const path = require('path');
const terser = require('terser');
const csso = require('csso');
const { minify: minifyHtml } = require('html-minifier-terser');
const archiver = require('archiver');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const { version } = require(path.join(ROOT_DIR, 'package.json'));

const SOURCE_FILES = [
  'assets',
  'content',
  'options',
  'popup',
  'offscreen',
  'background.js',
  'core.js',
  'manifest.json'
];

// Files that must be preserved verbatim (binary / already-minified third-party libs)
const COPY_VERBATIM_FILES = [
  'node_modules/@webcomponents/custom-elements/custom-elements.min.js'
];

const HTML_OPTIONS = {
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
  removeOptionalTags: false,
  removeAttributeQuotes: true,
  removeScriptTypeAttributes: true,
  removeStyleTypeAttributes: true,
  removeRedundantAttributes: true,
  collapseBooleanAttributes: true,
  useShortDoctype: true
};

/**
 * Recursively collect all files in a directory matching a predicate.
 */
function collectFiles(dir, predicate) {
  const results = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && predicate(fullPath)) {
        results.push(fullPath);
      }
    }
  }
  walk(dir);
  return results;
}

function isVerbatim(filePath) {
  const rel = path.relative(DIST_DIR, filePath);
  const norm = rel.split(path.sep).join('/');
  return COPY_VERBATIM_FILES.some((s) => norm === s.split('/').join('/'));
}

async function main() {
  // ── Step 1: Clean previous build ──────────────────────────────────
  if (fs.existsSync(DIST_DIR)) {
    console.log('🧹 Cleaning previous build…');
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }

  // ── Step 2: Copy production files ──────────────────────────────────
  console.log('📁 Copying files…');
  for (const file of SOURCE_FILES) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
    }
  }

  // ── Step 2b: Copy verbatim dependencies (referenced by manifest) ────
  console.log('📦 Copying third-party dependencies…');
  for (const file of COPY_VERBATIM_FILES) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`   ✓ ${file}`);
    } else {
      console.warn(`   ⚠ missing ${file}`);
    }
  }

  // ── Step 3: Minify JavaScript ─────────────────────────────────────
  console.log('⚡ Minifying JavaScript…');
  const jsFiles = collectFiles(DIST_DIR, f => f.endsWith('.js') && !isVerbatim(f));
  for (const filePath of jsFiles) {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await terser.minify(code, {
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    if (result.error) {
      throw new Error(`terser error in ${path.relative(ROOT_DIR, filePath)}: ${result.error.message}`);
    }
    fs.writeFileSync(filePath, result.code, 'utf8');
    const saved = ((code.length - result.code.length) / code.length * 100).toFixed(1);
    console.log(`   ✓ ${path.relative(DIST_DIR, filePath)}  (—${saved}%)`);
  }

  // ── Step 4: Minify CSS ────────────────────────────────────────────
  console.log('🎨 Minifying CSS…');
  const cssFiles = collectFiles(DIST_DIR, f => f.endsWith('.css'));
  for (const filePath of cssFiles) {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = csso.minify(code);
    fs.writeFileSync(filePath, result.css, 'utf8');
    const saved = ((code.length - result.css.length) / code.length * 100).toFixed(1);
    console.log(`   ✓ ${path.relative(DIST_DIR, filePath)}  (—${saved}%)`);
  }

  // ── Step 5: Minify JSON ───────────────────────────────────────────
  console.log('🗂️ Minifying JSON…');
  const jsonFiles = collectFiles(DIST_DIR, f => f.endsWith('.json'));
  for (const filePath of jsonFiles) {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = JSON.stringify(JSON.parse(code));
    fs.writeFileSync(filePath, result, 'utf8');
    const saved = ((code.length - result.length) / code.length * 100).toFixed(1);
    if (Number(saved) > 0) {
      console.log(`   ✓ ${path.relative(DIST_DIR, filePath)}  (—${saved}%)`);
    }
  }

  // ── Step 6: Minify HTML ───────────────────────────────────────────
  console.log('📄 Minifying HTML…');
  const htmlFiles = collectFiles(DIST_DIR, f => f.endsWith('.html'));
  for (const filePath of htmlFiles) {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await minifyHtml(code, HTML_OPTIONS);
    fs.writeFileSync(filePath, result, 'utf8');
    const saved = ((code.length - result.length) / code.length * 100).toFixed(1);
    console.log(`   ✓ ${path.relative(DIST_DIR, filePath)}  (—${saved}%)`);
  }

  // ── Step 7: Create zip archive ────────────────────────────────────
  console.log('📦 Creating zip archive…');
  const zipName = `puzzleenglishdictionary-v${version}.zip`;
  const zipPath = path.join(ROOT_DIR, zipName);

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const sizeKB = (archive.pointer() / 1024).toFixed(1);
      console.log(`   ✓ ${zipName}  (${sizeKB} KB)`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(new Error(`archiver error: ${err.message}`));
    });

    archive.pipe(output);
    archive.directory(DIST_DIR, false);
    archive.finalize();
  });

  // ── Done ──────────────────────────────────────────────────────────
  console.log('✅ Build complete!');
}

main().catch((err) => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});
