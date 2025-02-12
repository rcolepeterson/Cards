// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './util'

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
    ref.current.position.y = scroll.offset * 5 - 1.25 // Adjust vertical movement
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5 + scroll.offset * 5 - 1.25, 10], 0.3, delta) // Adjust camera movement
    state.camera.lookAt(0, 0, 0) // Look at center
  })
  return <group ref={ref} {...props} />
}

function Carousel({ radius = 1.2, count = 32, height = 0.1 }) {
  return Array.from({ length: count }, (_, i) => (
    <Card
      key={i}
      url={`/img${Math.floor(i % 10) + 1}_.jpg`}
      position={[
        Math.sin((i / count) * Math.PI * 2) * radius,
        (i / count) * height * count - (height * count) / 2, // Create a continuous spiral effect
        Math.cos((i / count) * Math.PI * 2) * radius
      ]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
    />
  ))
}

function Card({ url, ...props }) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const pointerOver = (e) => (e.stopPropagation(), hover(true))
  const pointerOut = () => hover(false)
  useFrame((state, delta) => {
    easing.damp3(ref.current.scale, hovered ? 0.9 : 0.8, 0.1, delta) // Adjust scale for hover effect
    easing.damp(ref.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta)
    easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta)
  })
  return (
    <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={pointerOver} onPointerOut={pointerOut} {...props}>
      <bentPlaneGeometry args={[0.08, 0.8, 0.8, 20, 20]} /> {/* Adjust geometry size */}
    </Image>
  )
}
