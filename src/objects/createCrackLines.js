import * as THREE from "three";
import { randomFloat } from "../utils/random.js";

export function createCrackLines() {
  const group = new THREE.Group();
  group.name = "ForegroundCrackLines";
  group.position.z = 2.35;
  group.add(createRadialCracks());
  group.add(createGlassRings());
  return group;
}

function createRadialCracks() {
  const points = [];

  for (let i = 0; i < 42; i += 1) {
    const angle = (i / 42) * Math.PI * 2 + randomFloat(-0.08, 0.08);
    const inner = randomFloat(0.08, 0.32);
    const outer = randomFloat(1.2, 4.25);
    const bend = randomFloat(-0.22, 0.22);

    points.push(new THREE.Vector3(Math.cos(angle) * inner, Math.sin(angle) * inner, 0));
    points.push(new THREE.Vector3(Math.cos(angle + bend) * outer, Math.sin(angle + bend) * outer, 0));

    if (i % 3 === 0) {
      points.push(new THREE.Vector3(Math.cos(angle) * outer * 0.45, Math.sin(angle) * outer * 0.45, 0));
      points.push(
        new THREE.Vector3(
          Math.cos(angle + 0.28) * outer * 0.72,
          Math.sin(angle + 0.28) * outer * 0.72,
          0,
        ),
      );
    }
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xcaf6ff,
    transparent: true,
    opacity: 0.56,
  });
  return new THREE.LineSegments(geometry, material);
}

function createGlassRings() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: 0x68dcff,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 5; i += 1) {
    const radius = 0.38 + i * 0.36;
    const ring = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.012, 80), material);
    ring.rotation.z = randomFloat(-0.2, 0.2);
    ring.scale.y = randomFloat(0.68, 0.92);
    group.add(ring);
  }

  return group;
}
