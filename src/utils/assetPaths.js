export const MODEL_PATHS = {
  astronaut: "/models/astronaut.glb",
};

export const HDR_PATHS = {
  moonLab: "/hdr/moon_lab_1k.exr",
};

const TEXTURE_PRIORITY = {
  map: ["diffuse", "diff", "albedo", "basecolor", "base_color", "color", "col"],
  normalMap: ["normalgl", "normal_gl", "nor_gl", "normal", "nor"],
  roughnessMap: ["roughness", "rough"],
  aoMap: ["ambientocclusion", "ambient_occlusion", "ao"],
  displacementMap: ["displacement", "height", "disp"],
  metalnessMap: ["metallic", "metalness", "metal"],
};
const MATERIAL_TEXTURE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function loadAssetManifest() {
  try {
    const response = await fetch("/asset-manifest.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.warn("Asset manifest was not found. Fallback materials will be used.", error);
    return { textures: {} };
  }
}

export function resolveTextureSet(manifest, setName, allowedKeys) {
  const explicitSet = manifest?.textures?.[setName];
  if (explicitSet && Object.keys(explicitSet).length > 0) {
    return filterTextureKeys(explicitSet, allowedKeys);
  }

  const files = manifest?.textureFiles?.[setName] || [];
  return matchTextureFiles(files, allowedKeys);
}

function filterTextureKeys(textureSet, allowedKeys) {
  return allowedKeys.reduce((result, key) => {
    if (textureSet[key]) {
      result[key] = textureSet[key];
    }
    return result;
  }, {});
}

function matchTextureFiles(files, allowedKeys) {
  return allowedKeys.reduce((result, key) => {
    const path = findBestMatch(files, key);
    if (path) {
      result[key] = path;
    }
    return result;
  }, {});
}

function findBestMatch(files, key) {
  const tokens = TEXTURE_PRIORITY[key] || [];
  return files.filter(isBrowserMaterialTexture).find((file) => {
    const normalized = normalizeTextureName(file);
    return tokens.some((token) => normalized.includes(token));
  });
}

function isBrowserMaterialTexture(file) {
  const extension = file.split(".").pop().toLowerCase();
  return MATERIAL_TEXTURE_EXTENSIONS.has(`.${extension}`);
}

function normalizeTextureName(file) {
  return file
    .split("/")
    .pop()
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|exr|tif|tiff)$/u, "")
    .replace(/^(moon_01|metal_plate_02)_?/u, "")
    .replaceAll("-", "_");
}
