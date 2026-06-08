import gsap from "gsap";
import * as THREE from "three";
import { randomFloat, randomSign } from "../utils/random.js";

export function setupClickExplosion(shards) {
  function explode() {
    shards.forEach((shard) => {
      const direction = shard.basePosition.clone();
      if (direction.lengthSq() < 0.001) {
        direction.set(randomSign(), randomFloat(-0.4, 0.4), randomSign());
      }
      direction.normalize();

      const burst = direction.multiplyScalar(randomFloat(0.65, 1.9));
      const target = shard.basePosition.clone().add(burst);
      const rotationTarget = new THREE.Vector3(
        shard.baseRotation.x + randomFloat(-1.4, 1.4),
        shard.baseRotation.y + randomFloat(-1.6, 1.6),
        shard.baseRotation.z + randomFloat(-1.2, 1.2),
      );

      gsap.killTweensOf(shard.mesh.position);
      gsap.killTweensOf(shard.mesh.rotation);

      gsap
        .timeline()
        .to(shard.mesh.position, {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: randomFloat(0.34, 0.62),
          ease: "power3.out",
        })
        .to(shard.mesh.position, {
          x: shard.basePosition.x,
          y: shard.basePosition.y,
          z: shard.basePosition.z,
          duration: randomFloat(0.82, 1.28),
          ease: "sine.inOut",
        });

      gsap.to(shard.mesh.rotation, {
        x: rotationTarget.x,
        y: rotationTarget.y,
        z: rotationTarget.z,
        duration: randomFloat(0.8, 1.5),
        ease: "power2.out",
      });
    });
  }

  window.addEventListener("click", explode);
  return () => window.removeEventListener("click", explode);
}
