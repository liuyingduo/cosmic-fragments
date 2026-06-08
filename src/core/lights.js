import * as THREE from "three";

export function addLights(scene) {
  const keyLight = new THREE.DirectionalLight(0xdff7ff, 3.2);
  keyLight.position.set(-3, 6, 4);

  const rimLight = new THREE.DirectionalLight(0x3db8ff, 2.2);
  rimLight.position.set(5, 3, -5);

  const fillLight = new THREE.PointLight(0x687cff, 18, 22);
  fillLight.position.set(0, 2.4, 3.5);

  const ambient = new THREE.AmbientLight(0x8fb7ff, 0.18);

  scene.add(keyLight, rimLight, fillLight, ambient);
  return { keyLight, rimLight, fillLight, ambient };
}
