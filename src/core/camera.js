import * as THREE from "three";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    160,
  );
  camera.position.set(0, 1.5, 10);
  return camera;
}
