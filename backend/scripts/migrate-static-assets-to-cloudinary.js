require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../services/cloudinaryService');

const repoRoot = path.resolve(__dirname, '..', '..');
const publicImagesDir = path.join(repoRoot, 'frontend', 'public', 'images');
const outputConfigPath = path.join(repoRoot, 'frontend', 'src', 'config', 'cloudinaryStaticAssets.js');
const cloudFolderBase = 'nutracore/static';

const isDryRun = process.argv.includes('--dry-run');

const isAssetFile = (filename) => /\.(png|jpe?g|webp|gif|svg|mp4)$/i.test(filename);

const walkFiles = (dir, acc = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, acc);
      continue;
    }
    if (!isAssetFile(entry.name)) continue;
    acc.push(fullPath);
  }
  return acc;
};

const toPosix = (value) => value.replace(/\\/g, '/');

const buildPublicId = (absoluteFilePath) => {
  const relFromImages = path.relative(publicImagesDir, absoluteFilePath);
  const relNoExt = relFromImages.replace(path.extname(relFromImages), '');
  return `${cloudFolderBase}/${toPosix(relNoExt)}`;
};

const buildFrontendKey = (absoluteFilePath) => {
  const relFromImages = path.relative(publicImagesDir, absoluteFilePath);
  return `/images/${toPosix(relFromImages)}`;
};

const writeConfig = (mapping) => {
  const sortedKeys = Object.keys(mapping).sort();
  const bodyLines = sortedKeys.map((key) => `  '${key}': '${mapping[key]}'`);
  const content = `export const CLOUDINARY_STATIC_ASSETS = {\n${bodyLines.join(',\n')}\n};\n\nexport const getCloudinaryStaticAsset = (path, fallback = path) =>\n  CLOUDINARY_STATIC_ASSETS[path] || fallback;\n`;
  fs.writeFileSync(outputConfigPath, content, 'utf8');
};

const uploadOne = async (absoluteFilePath) => {
  const publicId = buildPublicId(absoluteFilePath);
  const key = buildFrontendKey(absoluteFilePath);
  if (isDryRun) {
    return { key, secure_url: `DRY_RUN:${publicId}` };
  }

  const isVideo = /\.mp4$/i.test(absoluteFilePath);
  const result = await cloudinary.uploader.upload(absoluteFilePath, {
    public_id: publicId,
    overwrite: true,
    resource_type: isVideo ? 'video' : 'image'
  });

  return { key, secure_url: result.secure_url };
};

const run = async () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Faltan credenciales de Cloudinary en variables de entorno');
  }

  if (!fs.existsSync(publicImagesDir)) {
    throw new Error(`No existe el directorio: ${publicImagesDir}`);
  }

  const files = walkFiles(publicImagesDir);
  if (!files.length) {
    throw new Error('No se encontraron assets para migrar');
  }

  console.log(`Assets detectados: ${files.length}`);
  const mapping = {};

  for (const file of files) {
    const uploaded = await uploadOne(file);
    mapping[uploaded.key] = uploaded.secure_url;
    console.log(`${uploaded.key} -> ${uploaded.secure_url}`);
  }

  writeConfig(mapping);
  console.log(`Mapa generado en: ${outputConfigPath}`);
  if (isDryRun) {
    console.log('Dry run completado. No se subió ningún archivo.');
  } else {
    console.log('Migración completada.');
  }
};

run().catch((error) => {
  console.error('Error en migración de assets:', error.message);
  process.exit(1);
});

