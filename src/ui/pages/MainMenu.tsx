import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STAGE_CONFIGS } from '../../game/stages/stageConfigs';

interface MainMenuProps {
  onStartStage: (stageId: number) => void;
  onOpenGDD: () => void;
  maxUnlockedStage: number;
}

export function MainMenu({ onStartStage, onOpenGDD, maxUnlockedStage }: MainMenuProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [showStages, setShowStages] = useState(false);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId = 0;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0f);

      const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(3, 2, 5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
      const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x00ffd5, transparent: true, opacity: 0.4 });
      const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      scene.add(wireframe);

      const faceMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x12121a, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x12121a, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x12121a, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x12121a, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x12121a, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x12121a, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
      ];
      const cube = new THREE.Mesh(cubeGeometry, faceMaterials);
      scene.add(cube);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0x00ffd5, 1, 15);
      pointLight.position.set(3, 3, 3);
      scene.add(pointLight);

      const localRenderer = renderer;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        cube.rotation.y += 0.003;
        cube.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        wireframe.rotation.copy(cube.rotation);
        localRenderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        localRenderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        localRenderer.dispose();
        if (localRenderer.domElement.parentElement) {
          localRenderer.domElement.parentElement.removeChild(localRenderer.domElement);
        }
      };
    } catch {
      return () => {
        if (animId) cancelAnimationFrame(animId);
        renderer?.dispose();
      };
    }
  }, []);

  const worlds = [
    { id: 1, name: 'FLATLAND', stages: [1, 2, 3, 4, 5], color: '#7a7a8e' },
    { id: 2, name: 'THE UNFOLD', stages: [6, 7, 8, 9, 10], color: '#00ffd5' },
  ];

  const currentWorld = worlds.find(w => w.id === selectedWorld);
  const worldStages = currentWorld
    ? STAGE_CONFIGS.filter(s => currentWorld.stages.includes(s.id))
    : [];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Courier New', monospace",
      background: '#0a0a0f',
    }}>
      <div ref={canvasRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
      }}>
        {!showStages ? (
          <>
            <div style={{
              fontSize: '10px',
              letterSpacing: '6px',
              color: '#00ffd5',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Dimension-Flipping Snake
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 6vw, 52px)',
              fontWeight: 700,
              color: '#e8e8f0',
              margin: '0 0 4px 0',
              letterSpacing: '-2px',
            }}>
              SUPER <span style={{ color: '#00ffd5' }}>SNAKE</span>
            </h1>
            <p style={{
              fontSize: '12px',
              color: '#7a7a8e',
              marginBottom: '40px',
            }}>
              Your 2D decisions reshape 3D reality
            </p>

            <button
              onClick={() => setShowStages(true)}
              style={{
                background: 'linear-gradient(135deg, #00ffd520, #8b5cf615)',
                border: '1px solid #00ffd540',
                color: '#00ffd5',
                padding: '14px 40px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                marginBottom: '12px',
                minWidth: '240px',
                transition: 'all 0.2s',
              }}
            >
              Play
            </button>
            <button
              onClick={() => onStartStage(1)}
              style={{
                background: 'transparent',
                border: '1px solid #1e1e2e',
                color: '#7a7a8e',
                padding: '10px 40px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                marginBottom: '12px',
                minWidth: '240px',
              }}
            >
              Quick Start
            </button>
            <button
              onClick={onOpenGDD}
              style={{
                background: 'transparent',
                border: '1px solid #1e1e2e',
                color: '#7a7a8e',
                padding: '10px 40px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                minWidth: '240px',
              }}
            >
              Design Document
            </button>
          </>
        ) : (
          <div style={{
            background: 'rgba(10, 10, 15, 0.85)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: '#7a7a8e',
                textTransform: 'uppercase',
              }}>
                Select Stage
              </div>
              <button
                onClick={() => setShowStages(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7a7a8e',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontFamily: 'inherit',
                }}
              >
                x
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {worlds.map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorld(w.id)}
                  style={{
                    flex: 1,
                    background: selectedWorld === w.id
                      ? 'linear-gradient(135deg, #00ffd520, #8b5cf615)'
                      : 'transparent',
                    border: selectedWorld === w.id
                      ? '1px solid #00ffd540'
                      : '1px solid #1e1e2e',
                    color: selectedWorld === w.id ? '#00ffd5' : '#7a7a8e',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {worldStages.map(stage => {
                const isUnlocked = stage.id <= maxUnlockedStage;
                return (
                  <button
                    key={stage.id}
                    onClick={() => isUnlocked && onStartStage(stage.id)}
                    disabled={!isUnlocked}
                    style={{
                      background: isUnlocked ? '#12121a' : '#0a0a0f',
                      border: `1px solid ${isUnlocked ? '#1e1e2e' : '#12121a'}`,
                      color: isUnlocked ? '#e8e8f0' : '#3a3a4e',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: stage.isBoss ? '#ff3366' : (isUnlocked ? '#e8e8f0' : '#3a3a4e'),
                      }}>
                        {stage.isBoss ? '★ ' : ''}{stage.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#7a7a8e', marginTop: '2px' }}>
                        {isUnlocked ? stage.description : 'Locked'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#7a7a8e',
                    }}>
                      {stage.id}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{
          position: 'absolute',
          bottom: '16px',
          fontSize: '9px',
          letterSpacing: '3px',
          color: '#3a3a4e',
          textTransform: 'uppercase',
        }}>
          WASD to move · Q/E to flip dimensions · ESC to pause
        </div>
      </div>
    </div>
  );
}
