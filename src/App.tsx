import { useState, useCallback } from 'react';
import { MainMenu } from './ui/pages/MainMenu';
import { GamePage } from './ui/pages/GamePage';
import { GDDViewer } from './ui/pages/GDDViewer';

type Page = 'menu' | 'game' | 'gdd';

function loadProgress(): number {
  try {
    const saved = localStorage.getItem('supersnake_progress');
    if (saved) {
      const progress = JSON.parse(saved);
      return progress.maxUnlockedStage || 1;
    }
  } catch { /* ignore */ }
  return 1;
}

function App() {
  const [page, setPage] = useState<Page>('menu');
  const [currentStageId, setCurrentStageId] = useState(1);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState(loadProgress);

  const saveProgress = useCallback((stage: number) => {
    try {
      localStorage.setItem('supersnake_progress', JSON.stringify({ maxUnlockedStage: stage }));
    } catch { /* ignore */ }
  }, []);

  const handleStartStage = useCallback((stageId: number) => {
    setCurrentStageId(stageId);
    setPage('game');
  }, []);

  const handleStageComplete = useCallback((nextStageId: number) => {
    if (nextStageId > maxUnlockedStage) {
      setMaxUnlockedStage(nextStageId);
      saveProgress(nextStageId);
    }
    if (nextStageId <= 10) {
      setCurrentStageId(nextStageId);
    } else {
      setPage('menu');
    }
  }, [maxUnlockedStage, saveProgress]);

  const handleMenu = useCallback(() => {
    setPage('menu');
  }, []);

  const handleOpenGDD = useCallback(() => {
    setPage('gdd');
  }, []);

  switch (page) {
    case 'menu':
      return (
        <MainMenu
          onStartStage={handleStartStage}
          onOpenGDD={handleOpenGDD}
          maxUnlockedStage={maxUnlockedStage}
        />
      );
    case 'game':
      return (
        <GamePage
          key={currentStageId}
          stageId={currentStageId}
          onMenu={handleMenu}
          onStageComplete={handleStageComplete}
        />
      );
    case 'gdd':
      return <GDDViewer onBack={handleMenu} />;
  }
}

export default App;
