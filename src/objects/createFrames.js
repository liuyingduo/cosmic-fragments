import * as THREE from "three";

export function createFrames(textureMaps) {
  const group = new THREE.Group();
  group.name = "MetalFrames";

  const material = new THREE.MeshStandardMaterial({
    color: 0x222830,
    metalness: 0.7,
    roughness: 0.35,
    ...textureMaps,
  });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x79dfff,
    transparent: true,
    opacity: 0.28,
  });

  for (let index = 0; index < 12; index += 1) {
    const frame = createFrame(index, material, edgeMaterial);
    group.add(frame);
  }

  group.position.z = -4;
  return group;
}

function createFrame(index, material, edgeMaterial) {
  const frame = new THREE.Group();
  const z = -index * 2.25;
  const width = 5.6 + index * 0.18;
  const height = 3.8 + index * 0.12;

  const top = createBeam(width, 0.08, 0.12, 0, height / 2, z, material);
  const bottom = createBeam(width, 0.08, 0.12, 0, -height / 2, z, material);
  const left = createBeam(0.08, height, 0.12, -width / 2, 0, z, material);
  const right = createBeam(0.08, height, 0.12, width / 2, 0, z, material);

  frame.add(top, bottom, left, right);
  frame.add(createFrameEdges(width, height, z, edgeMaterial));
  frame.rotation.z = index % 2 === 0 ? 0.04 : -0.04;
  return frame;
}

function createBeam(width, height, depth, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
}

function createFrameEdges(width, height, z, material) {
  const shape = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-width / 2, -height / 2, z + 0.08),
    new THREE.Vector3(width / 2, -height / 2, z + 0.08),
    new THREE.Vector3(width / 2, height / 2, z + 0.08),
    new THREE.Vector3(-width / 2, height / 2, z + 0.08),
    new THREE.Vector3(-width / 2, -height / 2, z + 0.08),
  ]);
  return new THREE.Line(shape, material);
}
