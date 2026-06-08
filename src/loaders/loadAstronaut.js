import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MODEL_PATHS } from "../utils/assetPaths.js";

export async function loadAstronaut() {
  const group = new THREE.Group();
  group.name = "AstronautRoot";

  try {
    const gltf = await new GLTFLoader().loadAsync(MODEL_PATHS.astronaut);
    const model = gltf.scene;
    model.name = "AstronautModel";
    normalizeModel(model);
    group.add(model);
    return group;
  } catch (error) {
    console.warn(`Could not load astronaut model at ${MODEL_PATHS.astronaut}.`, error);
    group.add(createAstronautFallback());
    return group;
  }
}

function normalizeModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const largestAxis = Math.max(size.x, size.y, size.z);
  const scale = largestAxis > 0 ? 2.35 / largestAxis : 1;

  model.position.sub(center);
  model.scale.setScalar(scale);
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function createAstronautFallback() {
  const fallback = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xeef7ff,
    roughness: 0.45,
    metalness: 0.08,
  });
  const visorMaterial = new THREE.MeshStandardMaterial({
    color: 0x172231,
    roughness: 0.18,
    metalness: 0.5,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.95, 8, 18), bodyMaterial);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), bodyMaterial);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.08), visorMaterial);

  helmet.position.y = 0.88;
  visor.position.set(0, 0.9, 0.34);
  fallback.add(body, helmet, visor);
  return fallback;
}
