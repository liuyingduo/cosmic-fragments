import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { HDR_PATHS } from "../utils/assetPaths.js";

export async function loadEnvironment(scene, renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  try {
    const texture = await new EXRLoader().loadAsync(HDR_PATHS.moonLab);
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
    return envMap;
  } catch (error) {
    console.warn(`Could not load EXR environment at ${HDR_PATHS.moonLab}.`, error);
    pmremGenerator.dispose();
    return null;
  }
}
