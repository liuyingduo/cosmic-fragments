import * as THREE from "three";

export function createGround(textureMaps) {
  const geometry = new THREE.PlaneGeometry(34, 34, 96, 96);
  const material = new THREE.MeshStandardMaterial({
    color: 0x77736b,
    roughness: 0.9,
    metalness: 0,
    ...textureMaps,
    displacementScale: textureMaps.displacementMap ? 0.08 : 0,
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.name = "MoonGround";
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.42;
  ground.position.z = -1.8;
  ground.receiveShadow = true;

  if (textureMaps.aoMap) {
    geometry.setAttribute("uv2", new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
  }

  return ground;
}
