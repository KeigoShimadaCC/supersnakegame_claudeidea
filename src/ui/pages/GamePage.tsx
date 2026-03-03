import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, type GameStatus } from '../../game/core/GameEngine';
import { GameState } from '../../game/core/types';
import { CubeRenderer } from '../../game/cube/CubeRenderer';
import { AudioManager } from '../../game/audio/AudioManager';
import { STAGE_CONFIGS } from '../../game/stages/stageConfigs';
import { HUD } from '../components/HUD';
import { StageIntro } from '../components/StageIntro';
import { DeathScreen } from '../components/DeathScreen';
import { StageCompleteScreen } from '../components/StageCompleteScreen';
import { PauseScreen } from '../components/PauseScreen';

interface GamePageProps {
  stageId: number;
  onMenu: () => void;
  onStageComplete: (stageId: number) => void;
}

export function GamePage({ stageId, onMenu, onStageComplete }: GamePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CubeRenderer | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.StageIntro);
  const [isMuted, setIsMuted] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const stageConfig = STAGE_CONFIGS.find(s => s.id === stageId);

  const handleGameEvent = useCallback((event: string, _data?: unknown) => {
    const engine = engineRef.current;
    const audio = audioRef.current;
    if (!engine) return;

    switch (event) {
      case 'stateChange':
        setGameState(_data as GameState);
        setStatus(engine.getStatus());
        break;
      case 'eat':
        audio?.playEat();
        setStatus(engine.getStatus());
        break;
      case 'death':
        audio?.playDeath();
        break;
      case 'stageComplete':
        audio?.playStageComplete();
        break;
      case 'bossDamage':
        audio?.playBossDamage();
        break;
      case 'dimensionFlip':
        audio?.playDimensionFlip();
        break;
      case 'frameContract':
        audio?.playFrameContract();
        break;
      case 'scoreChange':
        setStatus(engine.getStatus());
        break;
      case 'render':
        setStatus(engine.getStatus());
        break;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !stageConfig) return;

    const audio = new AudioManager();
    audio.init();
    audioRef.current = audio;

    const engine = new GameEngine();
    engine.addEventListener(handleGameEvent);
    engine.init(container);
    engineRef.current = engine;

    let cubeRenderer: CubeRenderer | null = null;
    try {
      cubeRenderer = new CubeRenderer(container, engine);
      cubeRenderer.setupFace(stageConfig.gridSize);
      rendererRef.current = cubeRenderer;

      if (stageConfig.world >= 2) {
        cubeRenderer.enable3DMode();
      }
    } catch {
      setWebglError(true);
    }

    engine.startStage(stageId);

    const handleClick = () => audio.resume();
    container.addEventListener('click', handleClick, { once: true });
    container.addEventListener('touchstart', handleClick, { once: true });

    return () => {
      engine.removeEventListener(handleGameEvent);
      engine.destroy();
      cubeRenderer?.dispose();
      audio.dispose();
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleClick);
    };
  }, [stageId, stageConfig, handleGameEvent]);

  const handleRetry = () => {
    const engine = engineRef.current;
    const renderer = rendererRef.current;
    if (!engine || !stageConfig) return;
    renderer?.setupFace(stageConfig.gridSize);
    engine.retryStage();
  };

  const handleNextStage = () => {
    const nextId = stageId + 1;
    onStageComplete(nextId);
  };

  const handleResume = () => {
    const engine = engineRef.current;
    if (engine) {
      engine.setState(stageConfig?.isBoss ? GameState.Boss : GameState.Playing);
    }
  };

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      const muted = audio.toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      background: '#0a0a0f',
      touchAction: 'none',
    }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />

      {webglError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0a0a0f',
          zIndex: 50,
          fontFamily: "'Courier New', monospace",
          color: '#7a7a8e',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#ff3366', fontSize: '14px', marginBottom: '12px', letterSpacing: '2px' }}>
            WEBGL UNAVAILABLE
          </div>
          <div style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '300px', marginBottom: '24px' }}>
            Your browser does not support WebGL, which is required for the 3D renderer.
            Try opening this page in Chrome, Firefox, or Safari on a device with GPU support.
          </div>
          <button onClick={onMenu} style={{
            background: 'transparent',
            border: '1px solid #1e1e2e',
            color: '#7a7a8e',
            padding: '10px 32px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
          }}>
            Back to Menu
          </button>
        </div>
      )}

      {status && (gameState === GameState.Playing || gameState === GameState.Boss) && (
        <HUD status={status} stageName={stageConfig?.name ?? ''} />
      )}

      {gameState === GameState.StageIntro && stageConfig && (
        <StageIntro
          stageId={stageConfig.id}
          stageName={stageConfig.name}
          description={stageConfig.description}
          world={stageConfig.world}
        />
      )}

      {gameState === GameState.Death && status && (
        <DeathScreen
          score={status.score}
          highScore={status.highScore}
          onRetry={handleRetry}
          onMenu={onMenu}
        />
      )}

      {(gameState === GameState.StageComplete || gameState === GameState.WorldComplete) && status && (
        <StageCompleteScreen
          stageId={status.stageId}
          score={status.score}
          onNext={handleNextStage}
          onMenu={onMenu}
          isWorldComplete={gameState === GameState.WorldComplete}
          world={status.world}
        />
      )}

      {gameState === GameState.Paused && (
        <PauseScreen
          onResume={handleResume}
          onMenu={onMenu}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
        />
      )}

      {/* Dimension flip hint for World 2 */}
      {stageConfig && stageConfig.world >= 2 && gameState === GameState.Playing && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          letterSpacing: '2px',
          color: '#3a3a4e',
          textTransform: 'uppercase',
          fontFamily: "'Courier New', monospace",
          pointerEvents: 'none',
        }}>
          Q/E: flip dimensions
        </div>
      )}
    </div>
  );
}
