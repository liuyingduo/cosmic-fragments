import * as THREE from "three";
import { randomFloat, randomInt, randomSign } from "../utils/random.js";

const SHARD_COLORS = [0x42c9ff, 0x8df3ff, 0x7690ff, 0xb5ecff];

export function createShards(count = 140) {
  const group = new THREE.Group();
  group.name = "GlassShards";
  const shards = [];

  for (let index = 0; index < count; index += 1) {
    const shard = createShard(index);
    shards.push(shard);
    group.add(shard.mesh);
  }

  return { group, shards };
}

function createShard(index) {
  const mesh = new THREE.Mesh(createShardGeometry(), createShardMaterial(index));
  const basePosition = new THREE.Vector3(
    randomFloat(-7, 7),
    randomFloat(-2.4, 3.4),
    randomFloat(-9.5, 3.2),
  );
  const baseRotation = new THREE.Euler(randomFloat(0, Math.PI), randomFloat(0, Math.PI), 0);
  const scale = randomFloat(0.16, 0.58);

  mesh.position.copy(basePosition);
  mesh.rotation.copy(baseRotation);
  mesh.scale.setScalar(scale);

  return {
    mesh,
    basePosition,
    baseRotation,
    orbit: randomFloat(0.2, 1.2),
    rotationSpeed: new THREE.Vector3(
      randomFloat(0.08, 0.45) * randomSign(),
      randomFloat(0.08, 0.55) * randomSign(),
      randomFloat(0.04, 0.32) * randomSign(),
    ),
  };
}

function createShardGeometry() {
  const pointCount = randomInt(3, 5);
  const vertices = [0, 0, randomFloat(-0.03, 0.03)];

  for (let i = 0; i < pointCount; i += 1) {
    const angle = (i / pointCount) * Math.PI * 2 + randomFloat(-0.45, 0.45);
    const radius = randomFloat(0.45, 1.1);
    vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, randomFloat(-0.04, 0.04));
  }

  const indices = [];
  for (let i = 1; i < pointCount; i += 1) {
    indices.push(0, i, i + 1);
  }
  indices.push(0, pointCount, 1);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createShardMaterial(index) {
  return new THREE.MeshPhysicalMaterial({
    color: SHARD_COLORS[index % SHARD_COLORS.length],
    transparent: true,
    opacity: randomFloat(0.16, 0.34),
    roughness: 0.05,
    metalness: 0,
    transmission: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}
