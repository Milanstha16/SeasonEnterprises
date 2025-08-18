import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function ProductViewer3D() {
  return (
    <div className="aspect-square w-full rounded-md border overflow-hidden">
      <Canvas camera={{ position: [2.8, 2, 3.6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <mesh rotation={[0.5, 0.8, 0]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial metalness={0.2} roughness={0.3} />
        </mesh>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
