import * as THREE from "three";

export function createFrames(textureMaps) {
  const group = new THREE.Group();
  group.name = "TimeCorridorFrames";

  const material = new THREE.MeshStandardMaterial({
    color: 0x222830,
    metalness: 0.7,
    roughness: 0.35,
    ...textureMaps,
  });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x79dfff,
    transparent: true,
    opacity: 0.36,
  });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x5ef6ff,
    transparent: true,
    opacity: 0.62,
  });

  for (let index = 0; index < 30; index += 1) {
    const frame = createFrame(index, material, edgeMaterial);
    frame.add(createLightBars(index, glowMaterial));
    group.add(frame);
  }

  group.position.z = 1.4;
  return group;
}

function createFrame(index, material, edgeMaterial) {
  const frame = new THREE.Group();
  const z = -index * 1.55;
  const width = 6.4 + Math.sin(index * 0.45) * 0.26;
  const height = 4.15 + Math.cos(index * 0.4) * 0.18;

  const top = createBeam(width, 0.09, 0.18, 0, height / 2, z, material);
  const bottom = createBeam(width, 0.09, 0.18, 0, -height / 2, z, material);
  const left = createBeam(0.09, height, 0.18, -width / 2, 0, z, material);
  const right = createBeam(0.09, height, 0.18, width / 2, 0, z, material);
  const crossTop = createBeam(1.1, 0.055, 0.16, -width / 2 + 0.75, height / 2 - 0.35, z, material);
  const crossBottom = createBeam(1.1, 0.055, 0.16, width / 2 - 0.75, -height / 2 + 0.35, z, material);

  frame.add(top, bottom, left, right, crossTop, crossBottom);
  frame.add(createFrameEdges(width, height, z, edgeMaterial));
  frame.rotation.z = Math.sin(index * 0.7) * 0.055;
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

function createLightBars(index, material) {
  const group = new THREE.Group();
  const z = -index * 1.55 + 0.08;
  const xOffset = index % 2 === 0 ? 2.55 : -2.55;

  for (let i = 0; i < 4; i += 1) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), material);
    bar.position.set(xOffset, -1.45 + i * 0.96, z);
    bar.scale.x = i % 2 === 0 ? 1 : 1.5;
    group.add(bar);
  }

  return group;
}
