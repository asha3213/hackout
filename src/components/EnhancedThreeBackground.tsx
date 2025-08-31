'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function EnhancedThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create hydrogen molecules with enhanced visuals
    const moleculeGeometry = new THREE.SphereGeometry(0.08, 12, 8);
    const bondGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    
    // Materials with energy colors
    const hydrogenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.8 
    });
    const electronMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.6 
    });
    const bondMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.4 
    });

    const molecules: THREE.Group[] = [];
    const moleculeCount = 40;

    for (let i = 0; i < moleculeCount; i++) {
      const moleculeGroup = new THREE.Group();
      
      // H2 molecule structure
      const atom1 = new THREE.Mesh(moleculeGeometry, hydrogenMaterial);
      const atom2 = new THREE.Mesh(moleculeGeometry, hydrogenMaterial);
      const bond = new THREE.Mesh(bondGeometry, bondMaterial);
      
      atom1.position.set(-0.15, 0, 0);
      atom2.position.set(0.15, 0, 0);
      bond.rotation.z = Math.PI / 2;
      
      moleculeGroup.add(atom1);
      moleculeGroup.add(atom2);
      moleculeGroup.add(bond);
      
      // Random position
      moleculeGroup.position.x = (Math.random() - 0.5) * 25;
      moleculeGroup.position.y = (Math.random() - 0.5) * 25;
      moleculeGroup.position.z = (Math.random() - 0.5) * 25;
      
      // Random rotation
      moleculeGroup.rotation.x = Math.random() * Math.PI;
      moleculeGroup.rotation.y = Math.random() * Math.PI;
      moleculeGroup.rotation.z = Math.random() * Math.PI;
      
      molecules.push(moleculeGroup);
      scene.add(moleculeGroup);
    }

    // Add energy particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      // Energy colors
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.1 + 0.3, 0.8, 0.6); // Green-blue spectrum
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 8;

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Animate molecules
      molecules.forEach((molecule, index) => {
        molecule.rotation.x += 0.005 + index * 0.0001;
        molecule.rotation.y += 0.008 + index * 0.0001;
        
        // Floating motion
        molecule.position.y += Math.sin(time + index) * 0.002;
        molecule.position.x += Math.cos(time * 0.7 + index) * 0.001;
        
        // Breathing effect
        const scale = 1 + Math.sin(time * 2 + index) * 0.1;
        molecule.scale.setScalar(scale);
      });

      // Animate particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.001;
        positions[i * 3] += Math.cos(time * 0.5 + i * 0.1) * 0.0005;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Rotate entire particle system
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}