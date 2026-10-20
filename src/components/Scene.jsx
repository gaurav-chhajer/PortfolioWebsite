import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const damp = THREE.MathUtils.damp

function Particles({ count }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 9
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      a[i * 3] = r * Math.sin(ph) * Math.cos(th)
      a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      a[i * 3 + 2] = r * Math.cos(ph)
    }
    return a
  }, [count])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#7dd3fc" transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Core({ progress }) {
  const group = useRef()
  const ring1 = useRef()
  const ring2 = useRef()

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const p = progress.current
    const { x, y } = state.pointer
    const wide = state.viewport.width > 7

    const g = group.current
    g.rotation.y = damp(g.rotation.y, t * 0.2 + p * Math.PI * 3 + x * 0.5, 4, dt)
    g.rotation.x = damp(g.rotation.x, Math.sin(t * 0.4) * 0.15 + p * 1.5 - y * 0.3, 4, dt)
    g.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03 - p * 0.3)

    // desktop: sits right of the hero text, then drifts side to side while scrolling
    const baseX = wide ? state.viewport.width * 0.22 : 0
    g.position.x = damp(g.position.x, baseX * (0.8 + 0.2 * Math.cos(p * Math.PI * 3)), 3, dt)
    g.position.y = damp(g.position.y, (wide ? 0 : 1.4) - p * 1.2, 3, dt)

    ring1.current.rotation.x = t * 0.3
    ring1.current.rotation.y = t * 0.15
    ring2.current.rotation.z = -t * 0.2
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#0b1230"
          metalness={0.8}
          roughness={0.25}
          flatShading
          emissive="#1b1f6b"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh scale={1.03}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring1}>
        <torusGeometry args={[2.3, 0.012, 16, 180]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh ref={ring2} rotation={[1, 0.4, 0]}>
        <torusGeometry args={[2.8, 0.008, 16, 180]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export default function Scene({ progress, reduced }) {
  const small = typeof window !== 'undefined' && window.innerWidth < 760
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 45 }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 3, 4]} color="#22d3ee" intensity={45} />
        <pointLight position={[-4, -2, 3]} color="#8b5cf6" intensity={45} />
        <Core progress={progress} />
        <Particles count={small ? 500 : 1400} />
      </Canvas>
    </div>
  )
}
