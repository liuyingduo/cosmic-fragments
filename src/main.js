import * as THREE from "three";
import "./style.css";
import { createCamera } from "./core/camera.js";
import { addLights } from "./core/lights.js";
import { createRenderer } from "./core/renderer.js";
import { setupResize } from "./core/resize.js";
import { createScene } from "./core/scene.js";
import { createComposer } from "./effects/composer.js";
import { createBackgroundShapes } from "./objects/createBackgroundShapes.js";
import { createCrackLines } from "./objects/createCrackLines.js";
import { createFrames } from "./objects/createFrames.js";
import { createGround } from "./objects/createGround.js";
import { createShards } from "./objects/createShards.js";
import { setupClickExplosion } from "./interactions/clickExplosion.js";
import { createMouseTracker } from "./interactions/mouse.js";
import { createScrollTracker } from "./interactions/scroll.js";
import { loadAstronaut } from "./loaders/loadAstronaut.js";
import { loadEnvironment } from "./loaders/loadEnvironment.js";
import { loadMetalTextures, loadMoonTextures } from "./loaders/loadTextures.js";
import { loadAssetManifest } from "./utils/assetPaths.js";
import { lerp, smoothstep } from "./utils/lerp.js";

const canvas = document.querySelector("#webgl");
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(canvas);
const { composer } = createComposer(renderer, scene, camera);
const clock = new THREE.Clock();

addLights(scene);

const mouse = createMouseTracker();
const scroll = createScrollTracker();
const cleanupResize = setupResize({ camera, renderer, composer });

const root = new THREE.Group();
root.name = "CosmicFragmentsRoot";
scene.add(root);

let astronaut = new THREE.Group();
let frames = new THREE.Group();
let crackLines = new THREE.Group();
let shardGroup = new THREE.Group();
let backgroundShapes = new THREE.Group();
let shards = [];
let cleanupClick = () => {};

animate();
init();

async function init() {
  const manifest = await loadAssetManifest();
  const [moonMaps, metalMaps, loadedAstronaut] = await Promise.all([
    loadMoonTextures(manifest),
    loadMetalTextures(manifest),
    loadAstronaut(),
    loadEnvironment(scene, renderer),
  ]);

  astronaut = loadedAstronaut;
  frames = createFrames(metalMaps);
  const shardResult = createShards(175);
  shardGroup = shardResult.group;
  shards = shardResult.shards;
  crackLines = createCrackLines();
  backgroundShapes = createBackgroundShapes();

  const ground = createGround(moonMaps);
  astronaut.position.set(0, -0.2, -15);
  root.add(ground, frames, shardGroup, crackLines, backgroundShapes, astronaut);
  cleanupClick = setupClickExplosion(shards);
}

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();
  const mouseState = mouse.update();
  const scrollProgress = scroll.update();

  updateCamera(mouseState, scrollProgress);
  updateAstronaut(mouseState, elapsed, scrollProgress);
  updateSceneGroups(mouseState, elapsed, delta, scrollProgress);

  if (composer) {
    composer.render(delta);
  } else {
    renderer.render(scene, camera);
  }
}

function updateCamera(mouseState, scrollProgress) {
  const rush = smoothstep(0.58, 0.92, scrollProgress);
  camera.position.x = lerp(camera.position.x, mouseState.x * (0.4 + rush * 0.18), 0.06);
  camera.position.y = lerp(camera.position.y, 1.15 + mouseState.y * 0.26 - rush * 0.18, 0.06);
  camera.position.z = lerp(camera.position.z, 9.8 - scrollProgress * 13 + rush * 6.2, 0.052);
  camera.lookAt(0, 0.04 + scrollProgress * 0.2, -11.5 + scrollProgress * 8.4);
}

function updateAstronaut(mouseState, elapsed, scrollProgress) {
  const emerge = smoothstep(0.22, 0.86, scrollProgress);
  const impact = smoothstep(0.7, 0.96, scrollProgress);

  astronaut.position.z = lerp(astronaut.position.z, -18 + emerge * 16.4, 0.08);
  astronaut.position.y = -0.16 + Math.sin(elapsed * 1.25) * 0.12 + emerge * 0.46;
  astronaut.scale.setScalar(1 + impact * 0.42);
  astronaut.rotation.x = lerp(astronaut.rotation.x, mouseState.y * 0.12, 0.05);
  astronaut.rotation.y = lerp(astronaut.rotation.y, mouseState.x * 0.28, 0.05);
  astronaut.rotation.z = Math.sin(elapsed * 0.7) * 0.025;
}

function updateSceneGroups(mouseState, elapsed, delta, scrollProgress) {
  const impact = smoothstep(0.62, 0.94, scrollProgress);

  frames.position.x = lerp(frames.position.x, mouseState.x * -0.38, 0.05);
  frames.position.y = lerp(frames.position.y, mouseState.y * -0.18, 0.05);
  frames.position.z = 1.4;
  frames.rotation.z = Math.sin(elapsed * 0.18) * 0.018 + mouseState.x * 0.015;

  crackLines.position.x = camera.position.x + mouseState.x * -0.1;
  crackLines.position.y = camera.position.y - 1.05 + mouseState.y * -0.08;
  crackLines.position.z = camera.position.z - 2.1;
  crackLines.rotation.z = Math.sin(elapsed * 0.25) * 0.02;
  crackLines.scale.setScalar(0.76 + impact * 0.34);
  crackLines.visible = scrollProgress > 0.18;
  crackLines.traverse((child) => {
    if (child.material) {
      child.material.opacity = child.type === "LineSegments" ? 0.18 + impact * 0.34 : 0.06 + impact * 0.14;
    }
  });

  backgroundShapes.rotation.z = mouseState.x * 0.03 + elapsed * 0.03 + scrollProgress * 0.28;
  backgroundShapes.position.y = mouseState.y * 0.16 + scrollProgress * 0.3;
  backgroundShapes.position.z = scrollProgress * 3.5;

  shardGroup.rotation.y = mouseState.x * 0.08 + scrollProgress * 0.88;
  shardGroup.rotation.x = mouseState.y * -0.04;
  shardGroup.position.z = impact * 0.9;

  shards.forEach((shard) => {
    shard.mesh.rotation.x += shard.rotationSpeed.x * delta;
    shard.mesh.rotation.y += shard.rotationSpeed.y * delta;
    shard.mesh.rotation.z += shard.rotationSpeed.z * delta;
    shard.mesh.position.y += Math.sin(elapsed * shard.orbit + shard.basePosition.x) * 0.0011;
  });
}

window.addEventListener("beforeunload", () => {
  cleanupClick();
  cleanupResize();
  mouse.dispose();
  scroll.dispose();
});
