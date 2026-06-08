import * as THREE from "three";
import { resolveTextureSet } from "../utils/assetPaths.js";

const textureLoader = new THREE.TextureLoader();

const COLOR_KEYS = new Set(["map"]);

export async function loadMoonTextures(manifest) {
  const paths = resolveTextureSet(manifest, "moon_01", [
    "map",
    "normalMap",
    "roughnessMap",
    "aoMap",
    "displacementMap",
  ]);
  return loadTextureSet(paths, { repeat: [5, 5] });
}

export async function loadMetalTextures(manifest) {
  const paths = resolveTextureSet(manifest, "metal_plate_02", [
    "map",
    "normalMap",
    "roughnessMap",
    "aoMap",
    "metalnessMap",
  ]);
  return loadTextureSet(paths, { repeat: [2, 2] });
}

async function loadTextureSet(paths, options) {
  const entries = Object.entries(paths);
  const loaded = await Promise.all(
    entries.map(async ([key, path]) => [key, await loadSingleTexture(path, key, options)]),
  );

  return loaded.reduce((result, [key, texture]) => {
    if (texture) {
      result[key] = texture;
    }
    return result;
  }, {});
}

async function loadSingleTexture(path, key, options) {
  if (path.toLowerCase().endsWith(".exr")) {
    console.warn(
      `Skipping EXR material texture ${path}. Use JPG, PNG, or WebP texture maps for browser materials.`,
    );
    return null;
  }

  try {
    const texture = await textureLoader.loadAsync(path);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.fromArray(options.repeat);
    texture.colorSpace = COLOR_KEYS.has(key) ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    return texture;
  } catch (error) {
    console.warn(`Could not load texture ${path}. This map will be skipped.`, error);
    return null;
  }
}
