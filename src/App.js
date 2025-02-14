// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './util'

const imageUrls = Array.from({ length: 10 }, () => 'https://www.rcolepeterson.com/_next/image?url=%2Fimages%2FHonda_SocialOGimage.png&w=640&q=75')

export const App = () => {
  const [images, setImages] = useState(Array.from({ length: 32 }, (_, i) => imageUrls[i % 10]))
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [sidebarContent, setSidebarContent] = useState(null)

  const handleCardClick = (content) => {
    setSidebarContent(content)
    setSidebarVisible(true)
  }

  const handleCloseSidebar = () => {
    setSidebarVisible(false)
    setSidebarContent(null)
  }

  return (
    <>
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={['#000', 8.5, 12]} />
        <ScrollControls pages={4} infinite>
          <Rig rotation={[0, 0, 0.15]}>
            <Carousel images={images} onCardClick={handleCardClick} />
          </Rig>
        </ScrollControls>
        <Environment preset="sunset" background blur={0.5} />
      </Canvas>
      <Sidebar content={sidebarContent} visible={sidebarVisible} onClose={handleCloseSidebar} />
    </>
  )
}

function Rig(props) {
  const ref = useRef()
  const scroll = useScroll()
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
    ref.current.rotation.z = scroll.offset * (Math.PI * 2) // Rotate helix
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta) // Move camera
    state.camera.lookAt(0, 0, 0) // Look at center
  })
  return <group ref={ref} {...props} />
}

function Carousel({ radius = 1.2, count = 16, height = 1, onCardClick }) {
  return Array.from({ length: count }, (_, i) => (
    <Card
      key={i}
      url={`/img${Math.floor(i % 10) + 1}_.jpg`}
      position={[
        Math.sin((i / count) * Math.PI * 2) * radius,
        ((i % 2 === 0 ? 1 : -1) * height) / 2, // Alternate vertical positions for two levels
        Math.cos((i / count) * Math.PI * 2) * radius
      ]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
      onClick={() => onCardClick(`Content for image ${i}`)}
    />
  ))
}

function Card({ url, onClick, ...props }) {
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
    <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={onClick} {...props}>
      <bentPlaneGeometry args={[0.08, 0.8, 0.8, 20, 20]} /> {/* Adjust geometry size */}
    </Image>
  )
}

function Sidebar({ content, visible, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: visible ? 0 : '-50vw',
        width: '50vw',
        height: '100vh',
        backgroundColor: 'white',
        zIndex: 1000,
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.5)',
        transition: 'right 0.3s ease-in-out'
      }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div>{content}</div>
    </div>
  )
}
