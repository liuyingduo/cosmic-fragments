export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function lerpVector3(target, source, amount) {
  target.x = lerp(target.x, source.x, amount);
  target.y = lerp(target.y, source.y, amount);
  target.z = lerp(target.z, source.z, amount);
}

export function smoothstep(edge0, edge1, value) {
  const clamped = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}
