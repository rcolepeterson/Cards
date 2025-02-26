// https://cydstumpel.nl/

import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './util'

let hoveredCard = null

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

  const addImage = () => {
    setImages([...images, imageUrls[images.length % 10]])
  }

  return (
    <>
      {/* <button onClick={addImage} style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
        Add Image
      </button> */}
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={['#000', 8.5, 12]} />
        <ScrollControls pages={4}>
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
    ref.current.position.y = scroll.offset * 2.5 - 1.25 // Adjust vertical movement
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5 + scroll.offset * 2.5 - 1.25, 10], 0.3, delta) // Adjust camera movement
    state.camera.lookAt(0, 0, 0) // Look at center
  })
  return <group ref={ref} {...props} />
}

function Carousel({ images = [], radius = 1.5, height = 0.1, gap = 0.2, onCardClick }) {
  // Add default value for images
  return images.map((url, i) => {
    const phi = (i / images.length) * Math.PI * 2 // Angle around the sphere
    const theta = Math.acos(1 - (2 * (i + 0.5)) / images.length) // Angle from top to bottom
    const x = Math.sin(theta) * Math.cos(phi) * radius
    const y = Math.cos(theta) * radius
    const z = Math.sin(theta) * Math.sin(phi) * radius
    let imageURL = `/img${Math.floor(i % 10) + 1}_.jpg`
    return <Card key={i} url={imageURL} position={[x, y, z]} rotation={[0, phi, 0]} onClick={() => onCardClick(`Content for image ${i}`)} />
  })
}

function Card({ url, position, rotation, onClick, ...props }) {
  const ref = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const waitingForExit = useRef(false) // Prevents switching before a full exit

  const pointerOver = (e) => {
    e.stopPropagation()
    if (!hoveredCard && !waitingForExit.current) {
      hoveredCard = ref.current
      setIsHovered(true)
    }
  }

  const pointerOut = () => {
    if (hoveredCard === ref.current) {
      waitingForExit.current = true // Prevent new hover until user fully leaves
      setTimeout(() => {
        hoveredCard = null
        waitingForExit.current = false // Now allow new hovers
        setIsHovered(false)
      }, 500) // Short delay to ensure full exit
    }
  }

  useFrame((state, delta) => {
    if (hoveredCard === ref.current) {
      easing.damp3(ref.current.position, [position[0], position[1], position[2] + 0.2], 0.1, delta)
      ref.current.renderOrder = 999
      ref.current.material.depthTest = false
      ref.current.lookAt(state.camera.position) // Make the card face the camera
    } else {
      easing.damp3(ref.current.position, position, 0.1, delta)
      easing.dampE(ref.current.rotation, rotation, 0.1, delta) // Reset rotation
      ref.current.renderOrder = 0
      ref.current.material.depthTest = true
    }

    const targetScale = isHovered ? 0.9 : 0.8
    easing.damp3(ref.current.scale, targetScale, 0.1, delta)
  })

  return (
    <Image
      ref={ref}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      onClick={onClick}
      position={position}
      rotation={rotation}
      {...props}>
      <planeGeometry args={[0.8, 0.8]} />{' '}
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
