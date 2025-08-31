'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  ArrowRight,
  Recycle
} from 'lucide-react';
import { blockchain } from '../lib/blockchain';
import { HydrogenBatch } from '../lib/mockData';

interface FlowNode {
  id: string;
  type: 'issue' | 'transfer' | 'retire';
  batch: HydrogenBatch;
  position: THREE.Vector3;
  timestamp: Date;
}

export default function Visualizer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  
  const [batches, setBatches] = useState<HydrogenBatch[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await blockchain.getBatches();
        setBatches(data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!mountRef.current || loading) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Create flow visualization
    const nodes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];
    
    // Node geometries
    const issueGeometry = new THREE.SphereGeometry(0.3, 16, 12);
    const transferGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
    const retireGeometry = new THREE.OctahedronGeometry(0.25);
    
    // Materials
    const issueMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.8 
    });
    const transferMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.8 
    });
    const retireMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0.8 
    });

    // Create nodes for each batch
    batches.forEach((batch, index) => {
      const x = (index % 5) * 2 - 4;
      const y = Math.floor(index / 5) * 2 - 2;
      const z = 0;

      // Issue node
      const issueNode = new THREE.Mesh(issueGeometry, issueMaterial);
      issueNode.position.set(x, y, z);
      issueNode.userData = { type: 'issue', batch, id: `issue-${batch.id}` };
      scene.add(issueNode);
      nodes.push(issueNode);

      // Transfer node (if transferred)
      if (batch.status === 'transferred' || batch.status === 'retired') {
        const transferNode = new THREE.Mesh(transferGeometry, transferMaterial);
        transferNode.position.set(x + 1, y, z);
        transferNode.userData = { type: 'transfer', batch, id: `transfer-${batch.id}` };
        scene.add(transferNode);
        nodes.push(transferNode);

        // Connection line
        const points = [
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(x + 1, y, z)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, opacity: 0.6, transparent: true });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        connections.push(line);
      }

      // Retire node (if retired)
      if (batch.status === 'retired') {
        const retireNode = new THREE.Mesh(retireGeometry, retireMaterial);
        retireNode.position.set(x + 2, y, z);
        retireNode.userData = { type: 'retire', batch, id: `retire-${batch.id}` };
        scene.add(retireNode);
        nodes.push(retireNode);

        // Connection line
        const points = [
          new THREE.Vector3(x + 1, y, z),
          new THREE.Vector3(x + 2, y, z)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xef4444, opacity: 0.6, transparent: true });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        connections.push(line);
      }
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.set(0, 0, 8);

    // Raycaster for node selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object;
        setSelectedNode({
          id: clickedNode.userData.id,
          type: clickedNode.userData.type,
          batch: clickedNode.userData.batch,
          position: clickedNode.position,
          timestamp: clickedNode.userData.batch.createdAt
        });
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      if (!isPlaying) return;
      
      animationIdRef.current = requestAnimationFrame(animate);

      // Animate nodes
      nodes.forEach((node, index) => {
        node.rotation.x += 0.01;
        node.rotation.y += 0.01;
        
        // Floating animation
        node.position.y += Math.sin(Date.now() * 0.001 + index) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [batches, isPlaying, loading]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && rendererRef.current && cameraRef.current && sceneRef.current) {
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };
      animate();
    }
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 8);
      cameraRef.current.lookAt(0, 0, 0);
    }
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-hydrogen-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading visualizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-gradient">Credit Flow Visualizer</span>
        </h1>
        <p className="text-xl text-gray-400">
          Interactive timeline of credit lifecycle: Issue → Transfer → Retire
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 3D Visualization */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hydrogen-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <BarChart3 className="w-6 h-6 mr-2" />
                    Credit Flow Network
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAnimation}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetView}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mountRef} 
                  className="w-full h-96 rounded-lg border border-white/10 bg-black/20"
                  style={{ minHeight: '400px' }}
                />
                
                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-energy-500 rounded-full"></div>
                    <span className="text-gray-400">Issue</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-hydrogen-500 rounded-full"></div>
                    <span className="text-gray-400">Transfer</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-400">Retire</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Node Details */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedNode ? 'Node Details' : 'Select a Node'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedNode ? (
                  <div className="text-center py-12 text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a node to view details</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Node Type */}
                    <div className="flex items-center space-x-2 mb-4">
                      {selectedNode.type === 'issue' && <Zap className="w-5 h-5 text-energy-500" />}
                      {selectedNode.type === 'transfer' && <ArrowRight className="w-5 h-5 text-hydrogen-500" />}
                      {selectedNode.type === 'retire' && <Recycle className="w-5 h-5 text-red-500" />}
                      <Badge 
                        variant={
                          selectedNode.type === 'issue' ? 'verified' :
                          selectedNode.type === 'transfer' ? 'pending' : 'retired'
                        }
                      >
                        {selectedNode.type.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Batch Information */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Batch Hash</h4>
                        <code className="text-xs text-energy-400 bg-white/5 px-2 py-1 rounded">
                          {selectedNode.batch.batchHash}
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Quantity</h4>
                        <p className="text-white font-semibold">
                          {selectedNode.batch.quantity.toLocaleString()} grams H₂
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Producer</h4>
                        <code className="text-xs text-gray-300">
                          {selectedNode.batch.producer.slice(0, 6)}...{selectedNode.batch.producer.slice(-4)}
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                        <Badge variant={
                          selectedNode.batch.status === 'issued' ? 'verified' :
                          selectedNode.batch.status === 'transferred' ? 'pending' : 'retired'
                        }>
                          {selectedNode.batch.status}
                        </Badge>
                      </div>

                      {selectedNode.batch.status === 'retired' && selectedNode.batch.retirementNote && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Retirement Note</h4>
                          <p className="text-sm text-gray-300 bg-white/5 p-2 rounded">
                            {selectedNode.batch.retirementNote}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="energy"
                      size="sm"
                      className="w-full mt-4"
                    >
                      View Evidence
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Flow Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Flow Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-energy-500 to-energy-600 rounded-full flex items-center justify-center mx-auto mb-3 energy-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {batches.length}
                </div>
                <div className="text-sm text-gray-400">Total Batches Issued</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-hydrogen-500 to-hydrogen-600 rounded-full flex items-center justify-center mx-auto mb-3 hydrogen-glow">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {batches.filter(b => b.status === 'transferred').length}
                </div>
                <div className="text-sm text-gray-400">Credits Transferred</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Recycle className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {batches.filter(b => b.status === 'retired').length}
                </div>
                <div className="text-sm text-gray-400">Credits Retired</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}