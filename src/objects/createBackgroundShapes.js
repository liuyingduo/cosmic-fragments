import * as THREE from "three";

export function createBackgroundShapes() {
  const group = new THREE.Group();
  group.name = "BackgroundShapes";

  group.add(createSoftPlane(-3.8, 1.6, -8.8, 0x175cff, 0.16));
  group.add(createSoftPlane(3.6, -0.3, -7.2, 0x19d7ff, 0.12));
  group.add(createRing(-2.2, 0.2, -5.4, 1.35));
  group.add(createRing(2.8, 1.7, -9.2, 2.2));
  group.add(createTorus());
  group.add(createGlowBlocks());
  group.add(createTimeStreaks());
  group.add(createLineField());

  return group;
}

function createSoftPlane(x, y, z, color, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4), material);
  plane.position.set(x, y, z);
  plane.rotation.set(0.25, -0.4, 0.18);
  return plane;
}

function createRing(x, y, z, radius) {
  const material = new THREE.MeshBasicMaterial({
    color: 0xdaf8ff,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.018, 96), material);
  ring.position.set(x, y, z);
  ring.rotation.set(0.5, 0.1, 0.2);
  return ring;
}

function createTorus() {
  const material = new THREE.MeshBasicMaterial({
    color: 0x55d8ff,
    transparent: true,
    opacity: 0.2,
    wireframe: true,
  });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.025, 8, 96), material);
  torus.position.set(0.3, 2.0, -6.5);
  torus.rotation.set(1.0, 0.2, 0.4);
  return torus;
}

function createGlowBlocks() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: 0x66e6ff,
    transparent: true,
    opacity: 0.52,
  });

  for (let i = 0; i < 44; i += 1) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), material);
    const side = i % 2 === 0 ? -1 : 1;
    block.position.set(side * (2.7 + (i % 5) * 0.24), -1.9 + (i % 9) * 0.48, -4 - i * 0.78);
    block.scale.setScalar(1 + (i % 3) * 0.4);
    group.add(block);
  }
  return group;
}

function createTimeStreaks() {
  const points = [];

  for (let i = 0; i < 80; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (2.3 + (i % 8) * 0.38);
    const y = -2.1 + (i % 11) * 0.42;
    const z = -2.5 - i * 0.46;
    points.push(new THREE.Vector3(x, y, z));
    points.push(new THREE.Vector3(x + side * 0.18, y + 0.03, z - 1.2));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x8efcff,
    transparent: true,
    opacity: 0.22,
  });
  return new THREE.LineSegments(geometry, material);
}

function createLineField() {
  const points = [];
  for (let i = 0; i < 64; i += 1) {
    const x = -5 + i * 0.32;
    points.push(new THREE.Vector3(x, -2.1, -6.5 - i * 0.35));
    points.push(new THREE.Vector3(x + 0.12, 2.4, -8.2 - i * 0.35));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x237dff,
    transparent: true,
    opacity: 0.15,
  });
  return new THREE.LineSegments(geometry, material);
}
