// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './util'

let hoveredCard = null

export const App = () => (
  <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
    <fog attach="fog" args={['#000', 8.5, 12]} />
    <ScrollControls pages={4}>
      <Rig rotation={[0, 0, 0.15]}>
        <Carousel />
      </Rig>
    </ScrollControls>
    <Environment preset="sunset" background blur={0.5} />
  </Canvas>
)

function Rig(props) {
  const ref = useRef()
  const scroll = useScroll()
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
    ref.current.position.y = scroll.offset * 2.5 - 1.25 // Adjust vertical movement
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5 + scroll.offset * 2.5 - 1.25, 10], 0.3, delta) // Adjust camera movement
    state.camera.lookAt(0, 0, 0) // Look at center
  })
  return <group ref={ref} {...props} />
}

function Carousel({ radius = 1.5, count = 32, height = 0.1, gap = 0.2 }) {
  return Array.from({ length: count }, (_, i) => {
    const phi = (i / count) * Math.PI * 2 // Angle around the sphere
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count) // Angle from top to bottom
    const x = Math.sin(theta) * Math.cos(phi) * radius
    const y = Math.cos(theta) * radius
    const z = Math.sin(theta) * Math.sin(phi) * radius
    return <Card key={i} url={`/img${Math.floor(i % 10) + 1}_.jpg`} position={[x, y, z]} rotation={[0, phi, 0]} />
  })
}

function Card({ url, position, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  const pointerOver = (e) => {
    e.stopPropagation()
    //    setHovered(true)
    hoveredCard = ref.current
  }

  const pointerOut = () => {
    setHovered(false)
    if (hoveredCard === ref.current) {
      hoveredCard = null
    }
  }

  useEffect(() => {
    if (hoveredCard === ref.current) {
      ref.current.renderOrder = 999 // Ensures it's drawn last
      ref.current.material.depthTest = false // Ignore depth test so it's always on top
      ref.current.position.z += 0.1 // Slightly move forward in the Z-axis to ensure visibility
    } else {
      ref.current.renderOrder = 0 // Reset order
      ref.current.material.depthTest = true // Restore depth test
      ref.current.position.z -= 0.1 // Reset Z position
    }
  }, [hovered])

  useFrame((state, delta) => {
    const targetScale = hovered ? 0.9 : 0.8
    easing.damp3(ref.current.scale, targetScale, 0.1, delta) // Smooth scale animation
  })

  return <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={pointerOver} onPointerOut={pointerOut} position={position} {...props} />
}
