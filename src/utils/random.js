import * as THREE from "three";

export function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(randomFloat(min, max + 1));
}

export function randomSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

export function randomVector3(range) {
  return new THREE.Vector3(
    randomFloat(-range.x, range.x),
    randomFloat(-range.y, range.y),
    randomFloat(-range.z, range.z),
  );
}
