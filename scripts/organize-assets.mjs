import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".exr", ".tif", ".tiff"]);
const browserMaterialExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const textureSets = {
  moon_01: {
    outputDir: path.join(publicDir, "textures", "moon_01"),
    sourceHints: ["moon_01"],
    keys: {
      map: ["diffuse", "diff", "albedo", "basecolor", "base_color", "color", "col"],
      normalMap: ["normalgl", "normal_gl", "nor_gl", "normal", "nor"],
      roughnessMap: ["roughness", "rough"],
      aoMap: ["ambientocclusion", "ambient_occlusion", "ao"],
      displacementMap: ["displacement", "height", "disp"],
    },
  },
  metal_plate_02: {
    outputDir: path.join(publicDir, "textures", "metal_plate_02"),
    sourceHints: ["metal_plate_02"],
    keys: {
      map: ["diffuse", "diff", "albedo", "basecolor", "base_color", "color", "col"],
      normalMap: ["normalgl", "normal_gl", "nor_gl", "normal", "nor"],
      roughnessMap: ["roughness", "rough"],
      aoMap: ["ambientocclusion", "ambient_occlusion", "ao"],
      metalnessMap: ["metallic", "metalness", "metal"],
    },
  },
};

await main();

async function main() {
  await ensureProjectFolders();
  const files = await walk(rootDir);

  const manifest = {
    models: {},
    hdr: {},
    textures: {
      moon_01: {},
      metal_plate_02: {},
    },
    textureFiles: {
      moon_01: [],
      metal_plate_02: [],
    },
  };

  await copyNamedFile(files, "astronaut.glb", path.join(publicDir, "models", "astronaut.glb"));
  await copyNamedFile(files, "moon_lab_1k.exr", path.join(publicDir, "hdr", "moon_lab_1k.exr"));

  manifest.models.astronaut = "/models/astronaut.glb";
  manifest.hdr.moonLab = "/hdr/moon_lab_1k.exr";

  for (const [setName, config] of Object.entries(textureSets)) {
    await collectTextureSet(files, setName, config);
    const copiedFiles = await listPublicTextureFiles(config.outputDir, setName);
    manifest.textureFiles[setName] = copiedFiles;
    manifest.textures[setName] = matchTextureKeys(copiedFiles, config.keys);
  }

  await fs.writeFile(
    path.join(publicDir, "asset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log("Asset organization complete.");
  console.log("Manifest written to public/asset-manifest.json.");
}

async function ensureProjectFolders() {
  await Promise.all([
    fs.mkdir(path.join(publicDir, "models"), { recursive: true }),
    fs.mkdir(path.join(publicDir, "hdr"), { recursive: true }),
    fs.mkdir(path.join(publicDir, "textures", "moon_01"), { recursive: true }),
    fs.mkdir(path.join(publicDir, "textures", "metal_plate_02"), { recursive: true }),
  ]);
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (shouldSkip(fullPath, entry)) {
        return [];
      }
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    }),
  );
  return nested.flat();
}

function shouldSkip(fullPath, entry) {
  const relative = path.relative(rootDir, fullPath);
  const firstSegment = relative.split(path.sep)[0];
  return (
    firstSegment === "node_modules" ||
    firstSegment === "dist" ||
    firstSegment === ".git" ||
    firstSegment === "public" ||
    entry.name === ".DS_Store"
  );
}

async function copyNamedFile(files, filename, targetPath) {
  const source = files.find((file) => path.basename(file).toLowerCase() === filename);
  if (!source) {
    console.warn(`Missing ${filename}. The app will use its fallback if available.`);
    return;
  }

  await fs.copyFile(source, targetPath);
  console.log(`Copied ${path.relative(rootDir, source)} -> ${path.relative(rootDir, targetPath)}`);
}

async function collectTextureSet(files, setName, config) {
  await fs.mkdir(config.outputDir, { recursive: true });
  const copiedFromFolders = await copyTextureImages(files, setName, config);
  const copiedFromZip = await copyTextureZipEntries(files, setName, config);

  if (copiedFromFolders + copiedFromZip === 0) {
    const hasBlend = files.some((file) => {
      const normalized = file.toLowerCase();
      return normalized.includes(setName) && normalized.endsWith(".blend");
    });
    const hasZip = files.some((file) => {
      const normalized = file.toLowerCase();
      return normalized.includes(setName) && normalized.endsWith(".zip");
    });

    if (hasBlend || hasZip) {
      console.warn(
        "Three.js 不能直接加载 .blend 材质文件，请重新从 Poly Haven 下载 JPG/PNG ZIP 格式的 texture 包。",
      );
    } else {
      console.warn(`No texture images found for ${setName}. Fallback material will be used.`);
    }
  }
}

async function copyTextureImages(files, setName, config) {
  const candidates = files.filter((file) => {
    const lowerPath = file.toLowerCase();
    const extension = path.extname(file).toLowerCase();
    return lowerPath.includes(setName) && imageExtensions.has(extension);
  });

  for (const source of candidates) {
    await copyTextureFile(source, config.outputDir);
  }
  return candidates.length;
}

async function copyTextureZipEntries(files, setName, config) {
  const zipFiles = files.filter((file) => {
    const lowerPath = file.toLowerCase();
    return lowerPath.includes(setName) && lowerPath.endsWith(".zip");
  });

  let copied = 0;
  for (const zipPath of zipFiles) {
    const zip = new AdmZip(zipPath);
    const imageEntries = zip.getEntries().filter((entry) => {
      const extension = path.extname(entry.entryName).toLowerCase();
      return !entry.isDirectory && imageExtensions.has(extension);
    });

    if (imageEntries.length === 0) {
      console.warn(
        "Three.js 不能直接加载 .blend 材质文件，请重新从 Poly Haven 下载 JPG/PNG ZIP 格式的 texture 包。",
      );
      continue;
    }

    for (const entry of imageEntries) {
      const target = path.join(config.outputDir, path.basename(entry.entryName));
      await fs.writeFile(target, entry.getData());
      copied += 1;
      console.log(`Extracted ${entry.entryName} -> ${path.relative(rootDir, target)}`);
    }
  }
  return copied;
}

async function copyTextureFile(source, outputDir) {
  const target = path.join(outputDir, path.basename(source));
  await fs.copyFile(source, target);
  console.log(`Copied ${path.relative(rootDir, source)} -> ${path.relative(rootDir, target)}`);
}

async function listPublicTextureFiles(outputDir, setName) {
  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => `/textures/${setName}/${entry.name}`);
}

function matchTextureKeys(files, keys) {
  return Object.entries(keys).reduce((result, [key, tokens]) => {
    const match = files.filter(isBrowserMaterialTexture).find((file) => {
      const normalized = normalizeTextureName(file);
      return tokens.some((token) => normalized.includes(token));
    });

    if (match) {
      result[key] = match;
    }
    return result;
  }, {});
}

function isBrowserMaterialTexture(file) {
  return browserMaterialExtensions.has(path.extname(file).toLowerCase());
}

function normalizeTextureName(file) {
  return path
    .basename(file)
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|exr|tif|tiff)$/u, "")
    .replace(/^(moon_01|metal_plate_02)_?/u, "")
    .replaceAll("-", "_");
}
