import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createChromaticAberrationPass } from "./chromaticAberrationPass.js";

export function createComposer(renderer, scene, camera) {
  try {
    const composer = new EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.48,
      0.4,
      0.2,
    );
    const chromaticPass = createChromaticAberrationPass();

    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(chromaticPass);

    return { composer, renderPass, bloomPass, chromaticPass };
  } catch (error) {
    console.warn("Post-processing failed to initialize. Falling back to renderer.", error);
    return { composer: null };
  }
}
