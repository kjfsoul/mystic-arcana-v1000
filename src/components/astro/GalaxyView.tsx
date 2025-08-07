import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Constants
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 2000;
const SPHERE_SEGMENTS = 32;
const ROUGHNESS = 0.8;
const AMBIENT_LIGHT_COLOR = 0x404040;
const POINT_LIGHT_DISTANCE = 3000;
const DEFAULT_CAMERA_FALLBACK: [number, number, number] = [0, 0, 200];
const CAMERA_HEIGHT_OFFSET = 2;
const CAMERA_DISTANCE_OFFSET = 10;

// TODO: These constants are for future WebGL implementation
// const CAMERA_FOV = 75;
// const CAMERA_NEAR = 0.1;
// const CAMERA_FAR = 2000;
// const SPHERE_SEGMENTS = 32;
// const ROUGHNESS = 0.8;
// const AMBIENT_LIGHT_COLOR = 0x404040;
// const POINT_LIGHT_DISTANCE = 3000;
// const DEFAULT_CAMERA_FALLBACK: [number, number, number] = [0, 0, 200];
// const DEFAULT_SCALE_FACTOR = 1;
// const DEFAULT_AMBIENT_LIGHT_INTENSITY = 2;
// const DEFAULT_POINT_LIGHT_INTENSITY = 3;

interface PlanetData {
  name: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: number;
  house: number;
  sign: string;
  isRetrograde: boolean;
}

interface GalaxyViewProps {
  pov: "Earth" | "Moon" | "Mars";
  planets: PlanetData[];
  scaleFactor?: number;
  cameraFallbackPosition?: [number, number, number];
  ambientLightIntensity?: number;
  pointLightIntensity?: number;
}

interface TooltipState {
  content: string;
  x: number;
  y: number;
}

const GalaxyView: React.FC<GalaxyViewProps> = ({
  pov,
  planets,
  scaleFactor = 1,
  cameraFallbackPosition = DEFAULT_CAMERA_FALLBACK,
  ambientLightIntensity = 2,
  pointLightIntensity = 3,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const controlsRef = useRef<OrbitControls>(null);

  useEffect(() => {
    if (!mountRef.current || planets.length === 0) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      width / height,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      AMBIENT_LIGHT_COLOR,
      ambientLightIntensity,
    );
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(
      0xffffff,
      pointLightIntensity,
      POINT_LIGHT_DISTANCE,
    );
    scene.add(pointLight);

    // Create planets
    const planetObjects: THREE.Mesh[] = [];
    planets.forEach((planet) => {
      const geometry = new THREE.SphereGeometry(
        planet.size,
        SPHERE_SEGMENTS,
        SPHERE_SEGMENTS,
      );
      const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        roughness: ROUGHNESS,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        planet.x * scaleFactor,
        planet.y * scaleFactor,
        planet.z * scaleFactor,
      );
      sphere.userData = planet;
      scene.add(sphere);
      planetObjects.push(sphere);
    });

    // Set camera POV
    const povObject = planets.find((p) => p.name === pov);
    if (povObject) {
      camera.position.set(
        povObject.x * scaleFactor,
        povObject.y * scaleFactor + povObject.size * CAMERA_HEIGHT_OFFSET,
        povObject.z * scaleFactor + povObject.size * CAMERA_DISTANCE_OFFSET,
      );
      controls.target.set(
        povObject.x * scaleFactor,
        povObject.y * scaleFactor,
        povObject.z * scaleFactor,
      );
      setError(false);
    } else {
      const [x, y, z] = cameraFallbackPosition;
      camera.position.set(x, y, z);
      setError(true);
    }

    // Tooltip handling
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetObjects);

      if (intersects.length > 0) {
        const planetData = intersects[0].object.userData as PlanetData;
        setTooltip({
          content: `${planetData.name} - ${planetData.sign} (House ${planetData.house})${planetData.isRetrograde ? " [R]" : ""}`,
          x: event.clientX,
          y: event.clientY,
        });
      } else {
        setTooltip(null);
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [
    pov,
    planets,
    scaleFactor,
    cameraFallbackPosition,
    ambientLightIntensity,
    pointLightIntensity,
  ]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          {tooltip.content}
        </div>
      )}
      {error && (
        <div style={{ color: "red", padding: "10px" }}>
          POV planet not found
        </div>
      )}
    </div>
  );
};

export default GalaxyView;
