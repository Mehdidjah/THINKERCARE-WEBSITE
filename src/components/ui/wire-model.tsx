"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

export type WireModelVariant = "armillary" | "turbine" | "leadscrew" | "planetary"

type WireModelProps = {
  variant: WireModelVariant
  className?: string
}

type WirePiece = {
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  opacity?: number
}

function edgesFrom(geometry: THREE.BufferGeometry) {
  const edges = new THREE.EdgesGeometry(geometry, 1)
  geometry.dispose()
  return edges
}

function centeredEdges(geometry: THREE.BufferGeometry) {
  geometry.center()
  return edgesFrom(geometry)
}

function createGearShape(teeth = 8, inner = 0.32, outer = 0.54) {
  const shape = new THREE.Shape()
  const steps = teeth * 2

  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2 - Math.PI / 2
    const radius = index % 2 === 0 ? outer : inner
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (index === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }

  shape.closePath()
  return shape
}

function createGearGeometry(teeth = 8, inner = 0.32, outer = 0.54, depth = 0.08) {
  return centeredEdges(
    new THREE.ExtrudeGeometry(createGearShape(teeth, inner, outer), {
      depth,
      bevelEnabled: false,
    }),
  )
}

function createVariant(variant: WireModelVariant) {
  const pieces: WirePiece[] = []
  let baseRotation: [number, number, number] = [-0.22, 0.34, 0]
  let scale: [number, number, number] = [1, 1, 1]

  if (variant === "armillary") {
    pieces.push(
      {
        geometry: edgesFrom(new THREE.TorusGeometry(0.9, 0.055, 6, 72)),
        rotation: [Math.PI / 2, 0, 0],
      },
      {
        geometry: edgesFrom(new THREE.TorusGeometry(0.9, 0.055, 6, 72)),
        rotation: [0, 0.22, 0],
      },
      {
        geometry: edgesFrom(new THREE.TorusGeometry(0.9, 0.055, 6, 72)),
        rotation: [0, Math.PI / 2, 0],
      },
      {
        geometry: centeredEdges(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 4, 1)),
        rotation: [0.7, 0.2, -0.28],
      },
      {
        geometry: centeredEdges(new THREE.BoxGeometry(0.22, 0.22, 0.22)),
        opacity: 0.68,
      },
    )
    baseRotation = [-0.34, 0.62, -0.16]
    scale = [1.08, 1.08, 1.08]
  }

  if (variant === "turbine") {
    pieces.push(
      {
        geometry: edgesFrom(new THREE.TorusGeometry(0.98, 0.052, 6, 56)),
        rotation: [0, 0, 0],
      },
      {
        geometry: createGearGeometry(8, 0.28, 0.5, 0.1),
        rotation: [0, 0, 0.18],
      },
      {
        geometry: centeredEdges(new THREE.BoxGeometry(1.9, 0.055, 0.055)),
        rotation: [0, 0, -0.28],
        opacity: 0.72,
      },
    )

    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2
      const radius = 0.62
      pieces.push({
        geometry: centeredEdges(new THREE.BoxGeometry(0.18, 0.55, 0.12)),
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
        rotation: [0, 0, angle],
        opacity: index % 2 === 0 ? 0.88 : 0.62,
      })
    }

    baseRotation = [-0.18, 0.42, 0.18]
    scale = [1.02, 1.02, 1.02]
  }

  if (variant === "leadscrew") {
    pieces.push(
      {
        geometry: centeredEdges(new THREE.CylinderGeometry(0.065, 0.065, 1.85, 6, 1)),
        rotation: [0, 0, Math.PI / 2],
      },
      {
        geometry: centeredEdges(new THREE.CylinderGeometry(0.21, 0.21, 0.52, 6, 1)),
        rotation: [0, 0, Math.PI / 2],
      },
      {
        geometry: centeredEdges(new THREE.BoxGeometry(0.44, 0.44, 0.44)),
        opacity: 0.42,
      },
    )

    for (let index = -3; index <= 3; index += 1) {
      pieces.push({
        geometry: centeredEdges(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 8, 1)),
        position: [index * 0.27, 0, 0],
        rotation: [0, 0, Math.PI / 2],
        opacity: index === 0 ? 0.9 : 0.68,
      })
    }

    baseRotation = [0.75, 0.2, -0.65]
    scale = [1.16, 1.16, 1.16]
  }

  if (variant === "planetary") {
    pieces.push(
      {
        geometry: edgesFrom(new THREE.TorusGeometry(0.82, 0.052, 6, 64)),
        rotation: [0, 0, 0],
      },
      {
        geometry: createGearGeometry(10, 0.27, 0.44, 0.1),
        rotation: [0, 0, 0.08],
      },
      {
        geometry: centeredEdges(new THREE.CylinderGeometry(0.18, 0.18, 1.05, 8, 1)),
        rotation: [Math.PI / 2, 0, 0],
        opacity: 0.58,
      },
    )

    for (let index = 0; index < 4; index += 1) {
      const angle = (index / 4) * Math.PI * 2 + Math.PI / 4
      const radius = 0.56
      pieces.push({
        geometry: createGearGeometry(7, 0.12, 0.22, 0.07),
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
        rotation: [0, 0, angle],
        opacity: 0.78,
      })
    }

    baseRotation = [-0.22, 0.54, -0.08]
    scale = [1.12, 1.12, 1.12]
  }

  return { pieces, baseRotation, scale }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()

    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return reduced
}

function useWireColor() {
  const [lineColor, setLineColor] = useState("#050505")

  useEffect(() => {
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue("--wire-model-line")
      .trim()

    setLineColor(computed || "#050505")
  }, [])

  return lineColor
}

function CameraAim() {
  const { camera } = useThree()

  useEffect(() => {
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

function WireModelLines({ variant }: { variant: WireModelVariant }) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(0)
  const reducedMotion = usePrefersReducedMotion()
  const lineColor = useWireColor()
  const model = useMemo(() => createVariant(variant), [variant])

  useEffect(() => {
    progress.current = reducedMotion ? 1 : 0
    model.pieces.forEach((piece) => {
      const count = piece.geometry.attributes.position.count
      piece.geometry.setDrawRange(0, reducedMotion ? count : 0)
    })
  }, [model, reducedMotion])

  useEffect(() => {
    return () => {
      model.pieces.forEach((piece) => piece.geometry.dispose())
    }
  }, [model])

  useFrame((_, delta) => {
    const current = group.current
    if (!current || reducedMotion) return

    progress.current = Math.min(1, progress.current + delta / 2)

    current.traverse((object) => {
      if (object instanceof THREE.LineSegments) {
        const geometry = object.geometry
        const count = geometry.attributes.position.count
        const visibleCount = Math.floor((progress.current * count) / 2) * 2
        geometry.setDrawRange(0, visibleCount)
      }
    })

    current.rotation.x += 0.004
    current.rotation.y += 0.007
  })

  return (
    <group ref={group} rotation={model.baseRotation} scale={model.scale}>
      {model.pieces.map((piece, index) => (
        <lineSegments
          key={`${variant}-${index}`}
          geometry={piece.geometry}
          position={piece.position}
          rotation={piece.rotation}
          scale={piece.scale}
        >
          <lineBasicMaterial color={lineColor} transparent opacity={piece.opacity ?? 0.86} />
        </lineSegments>
      ))}
    </group>
  )
}

export default function WireModel({ variant, className = "" }: WireModelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`wire-model-canvas ${className}`} aria-hidden="true">
      {mounted ? (
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [2.4, 1.7, 3.8], fov: 42 }}
          dpr={[1, 1.6]}
        >
          <CameraAim />
          <WireModelLines variant={variant} />
        </Canvas>
      ) : null}
    </div>
  )
}
