interface OrbitalElement {
  a: number; // semi-major axis
  e: number; // eccentricity
  i: number; // inclination
  L: number; // mean longitude at epoch
  L0?: number; // mean longitude at epoch (alternative)
  n?: number; // mean motion
  w: number; // argument of perihelion
  W: number; // longitude of ascending node
}
export const ORBITAL_ELEMENTS: Record<string, OrbitalElement> = {
  Mercury: { a: 0.387, e: 0.2056, i: 7.005, L: 252.251, L0: 252.251, n: 4.0923, w: 77.456, W: 48.331 },
  Venus: { a: 0.723, e: 0.0067, i: 3.394, L: 181.979, L0: 181.979, n: 1.6021, w: 131.532, W: 76.68 },
  Earth: { a: 1.0, e: 0.0167, i: 0.0, L: 100.464, L0: 100.464, n: 0.9856, w: 102.937, W: 0.0 },
  Mars: { a: 1.524, e: 0.0934, i: 1.85, L: -4.553, L0: -4.553, n: 0.5241, w: -23.943, W: 49.558 },
  Jupiter: { a: 5.203, e: 0.0484, i: 1.304, L: 34.396, L0: 34.396, n: 0.0831, w: 14.728, W: 100.473 },
  Saturn: { a: 9.537, e: 0.0541, i: 2.485, L: 49.954, L0: 49.954, n: 0.0334, w: 92.598, W: 113.662 },
  Uranus: { a: 19.191, e: 0.0472, i: 0.773, L: 313.238, L0: 313.238, n: 0.0117, w: 170.954, W: 74.016 },
  Neptune: { a: 30.068, e: 0.0086, i: 1.77, L: -55.12, L0: -55.12, n: 0.0060, w: 44.964, W: 131.784 },
  Pluto: { a: 39.482, e: 0.2488, i: 17.14, L: 238.929, L0: 238.929, n: 0.0040, w: 224.068, W: 110.299 },
};
