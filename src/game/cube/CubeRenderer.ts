import * as THREE from 'three';
import { type GameEngine } from '../core/GameEngine';
import { CubeFace, FoodType, GameState } from '../core/types';

const COLORS = {
  bg: 0x0a0a0f,
  grid: 0x1a1a2e,
  gridLine: 0x252540,
  snake: 0x00ffd5,
  snakeHead: 0x00ffaa,
  food: 0xff3366,
  foodTimeLimited: 0xf59e0b,
  foodDimensional: 0x8b5cf6,
  wall: 0x4a4a6a,
  wallMoving: 0x6a4a8a,
  boss: 0xff3366,
  hinge: 0xff6633,
  trailWall: 0x00ffd540,
  frameWall: 0xff336680,
  cubeEdge: 0x00ffd520,
  cubeFaceInactive: 0x0a0a1f,
};

interface ShakeState {
  intensity: number;
  timer: number;
  offset: THREE.Vector3;
}

export class CubeRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private engine: GameEngine;

  private cubeGroup: THREE.Group;
  private faceMeshes: Map<CubeFace, THREE.Group> = new Map();
  private snakeMeshes: THREE.Mesh[] = [];
  private foodMeshes: THREE.Mesh[] = [];
  private wallMeshes: THREE.Mesh[] = [];
  private hingeMeshes: THREE.Mesh[] = [];
  private particleSystem: THREE.Points | null = null;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private particleLifetimes: Float32Array;
  private particleCount = 200;

  private is3DMode = false;
  private targetRotation = new THREE.Euler();
  private currentRotation = new THREE.Euler();
  private rotationSpeed = 5;

  private shake: ShakeState = { intensity: 0, timer: 0, offset: new THREE.Vector3() };
  private cellSize = 0.5;
  private gridOffset = new THREE.Vector3();

  private snakeGeometry: THREE.BoxGeometry;
  private snakeMaterial: THREE.MeshStandardMaterial;
  private snakeHeadMaterial: THREE.MeshStandardMaterial;
  private foodGeometry: THREE.SphereGeometry;
  private wallGeometry: THREE.BoxGeometry;

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(COLORS.bg);
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COLORS.bg, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      50, container.clientWidth / container.clientHeight, 0.1, 100
    );
    this.camera.position.set(0, 0, 14);
    this.camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffd5, 0.5, 20);
    pointLight.position.set(0, 0, 5);
    this.scene.add(pointLight);

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);

    this.snakeGeometry = new THREE.BoxGeometry(this.cellSize * 0.85, this.cellSize * 0.85, this.cellSize * 0.3);
    this.snakeMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.snake,
      emissive: COLORS.snake,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.3,
    });
    this.snakeHeadMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.snakeHead,
      emissive: COLORS.snakeHead,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.2,
    });
    this.foodGeometry = new THREE.SphereGeometry(this.cellSize * 0.35, 12, 12);
    this.wallGeometry = new THREE.BoxGeometry(this.cellSize * 0.95, this.cellSize * 0.95, this.cellSize * 0.5);

    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);
    this.particleLifetimes = new Float32Array(this.particleCount);
    this.initParticles();

    window.addEventListener('resize', this.handleResize);

    this.engine.addEventListener(this.handleGameEvent);
  }

  private handleGameEvent = (event: string, data?: unknown) => {
    if (event === 'screenShake') {
      this.triggerShake(data as number);
    } else if (event === 'eat') {
      this.spawnEatParticles();
    } else if (event === 'dimensionFlip') {
      this.handleDimensionFlip(data as string);
    } else if (event === 'render') {
      const renderData = data as { alpha: number };
      this.renderFrame(renderData.alpha);
    }
  };

  private initParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particlePositions[i * 3] = 0;
      this.particlePositions[i * 3 + 1] = 0;
      this.particlePositions[i * 3 + 2] = -100;
      this.particleLifetimes[i] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const material = new THREE.PointsMaterial({
      color: COLORS.snake,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  private spawnEatParticles() {
    const head = this.engine.snake.getHead();
    if (!head) return;

    const worldPos = this.gridToWorld(head.pos.x, head.pos.y);
    let spawned = 0;

    for (let i = 0; i < this.particleCount && spawned < 15; i++) {
      if (this.particleLifetimes[i] <= 0) {
        this.particlePositions[i * 3] = worldPos.x;
        this.particlePositions[i * 3 + 1] = worldPos.y;
        this.particlePositions[i * 3 + 2] = worldPos.z;
        this.particleVelocities[i * 3] = (Math.random() - 0.5) * 3;
        this.particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 3;
        this.particleVelocities[i * 3 + 2] = Math.random() * 2;
        this.particleLifetimes[i] = 0.5 + Math.random() * 0.5;
        spawned++;
      }
    }
  }

  private updateParticles(dt: number) {
    let needsUpdate = false;
    for (let i = 0; i < this.particleCount; i++) {
      if (this.particleLifetimes[i] > 0) {
        this.particleLifetimes[i] -= dt;
        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * dt;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * dt;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * dt;
        this.particleVelocities[i * 3 + 1] -= 5 * dt;
        needsUpdate = true;

        if (this.particleLifetimes[i] <= 0) {
          this.particlePositions[i * 3 + 2] = -100;
        }
      }
    }
    if (needsUpdate && this.particleSystem) {
      (this.particleSystem.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  private triggerShake(intensity: number) {
    this.shake.intensity = intensity;
    this.shake.timer = intensity;
  }

  private updateShake(dt: number) {
    if (this.shake.timer > 0) {
      this.shake.timer -= dt;
      const progress = this.shake.timer / this.shake.intensity;
      const amp = progress * this.shake.intensity * 0.2;
      this.shake.offset.set(
        (Math.random() - 0.5) * amp,
        (Math.random() - 0.5) * amp,
        0
      );
    } else {
      this.shake.offset.set(0, 0, 0);
    }
  }

  setupFace(gridSize: number) {
    this.clearFaceMeshes();
    this.cellSize = 10 / gridSize;
    this.gridOffset.set(
      -(gridSize * this.cellSize) / 2 + this.cellSize / 2,
      -(gridSize * this.cellSize) / 2 + this.cellSize / 2,
      0
    );

    this.snakeGeometry.dispose();
    this.foodGeometry.dispose();
    this.wallGeometry.dispose();
    this.snakeGeometry = new THREE.BoxGeometry(this.cellSize * 0.85, this.cellSize * 0.85, this.cellSize * 0.3);
    this.foodGeometry = new THREE.SphereGeometry(this.cellSize * 0.35, 12, 12);
    this.wallGeometry = new THREE.BoxGeometry(this.cellSize * 0.95, this.cellSize * 0.95, this.cellSize * 0.5);

    const gridHelper = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: COLORS.gridLine, transparent: true, opacity: 0.3 });

    for (let i = 0; i <= gridSize; i++) {
      const pos = i * this.cellSize - (gridSize * this.cellSize) / 2;

      const hPoints = [new THREE.Vector3(pos, -(gridSize * this.cellSize) / 2, -0.01), new THREE.Vector3(pos, (gridSize * this.cellSize) / 2, -0.01)];
      const hGeo = new THREE.BufferGeometry().setFromPoints(hPoints);
      gridHelper.add(new THREE.Line(hGeo, lineMaterial));

      const vPoints = [new THREE.Vector3(-(gridSize * this.cellSize) / 2, pos, -0.01), new THREE.Vector3((gridSize * this.cellSize) / 2, pos, -0.01)];
      const vGeo = new THREE.BufferGeometry().setFromPoints(vPoints);
      gridHelper.add(new THREE.Line(vGeo, lineMaterial));
    }

    const bgGeometry = new THREE.PlaneGeometry(gridSize * this.cellSize, gridSize * this.cellSize);
    const bgMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.grid,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.position.z = -0.02;
    gridHelper.add(bgMesh);

    const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(
      gridSize * this.cellSize, gridSize * this.cellSize, 0.01
    ));
    const borderMat = new THREE.LineBasicMaterial({ color: COLORS.cubeEdge, transparent: true, opacity: 0.6 });
    gridHelper.add(new THREE.LineSegments(borderGeo, borderMat));

    this.cubeGroup.add(gridHelper);

    const faceGroup = new THREE.Group();
    this.faceMeshes.set(CubeFace.Front, faceGroup);
    this.cubeGroup.add(faceGroup);
  }

  private clearFaceMeshes() {
    while (this.cubeGroup.children.length > 0) {
      const child = this.cubeGroup.children[0];
      this.cubeGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    this.snakeMeshes = [];
    this.foodMeshes = [];
    this.wallMeshes = [];
    this.hingeMeshes = [];
    this.faceMeshes.clear();
  }

  private gridToWorld(gx: number, gy: number): THREE.Vector3 {
    return new THREE.Vector3(
      gx * this.cellSize + this.gridOffset.x,
      -gy * this.cellSize - this.gridOffset.y,
      0
    );
  }

  handleDimensionFlip(_direction: string) {
    if (!this.is3DMode) {
      this.is3DMode = true;
      this.camera.position.set(8, 6, 12);
      this.camera.lookAt(0, 0, 0);
    }

    switch (_direction) {
      case 'left':
        this.targetRotation.y -= Math.PI / 2;
        break;
      case 'right':
        this.targetRotation.y += Math.PI / 2;
        break;
      case 'up':
        this.targetRotation.x -= Math.PI / 2;
        break;
      case 'down':
        this.targetRotation.x += Math.PI / 2;
        break;
    }
  }

  enable3DMode() {
    this.is3DMode = true;
    this.camera.position.set(8, 6, 12);
    this.camera.lookAt(0, 0, 0);
  }

  disable3DMode() {
    this.is3DMode = false;
    this.camera.position.set(0, 0, 14);
    this.camera.lookAt(0, 0, 0);
    this.targetRotation.set(0, 0, 0);
    this.currentRotation.set(0, 0, 0);
    this.cubeGroup.rotation.set(0, 0, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderFrame(_alpha: number) {
    const dt = 1 / 60;

    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.rotationSpeed * dt;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.rotationSpeed * dt;
    this.cubeGroup.rotation.x = this.currentRotation.x;
    this.cubeGroup.rotation.y = this.currentRotation.y;

    this.updateShake(dt);
    this.updateParticles(dt);
    this.updateMeshes();

    this.camera.position.x = (this.is3DMode ? 8 : 0) + this.shake.offset.x;
    this.camera.position.y = (this.is3DMode ? 6 : 0) + this.shake.offset.y;

    this.renderer.render(this.scene, this.camera);
  }

  private updateMeshes() {
    this.snakeMeshes.forEach(m => {
      this.cubeGroup.remove(m);
    });
    this.foodMeshes.forEach(m => {
      this.cubeGroup.remove(m);
    });
    this.wallMeshes.forEach(m => {
      this.cubeGroup.remove(m);
    });
    this.hingeMeshes.forEach(m => {
      this.cubeGroup.remove(m);
    });
    this.snakeMeshes = [];
    this.foodMeshes = [];
    this.wallMeshes = [];
    this.hingeMeshes = [];

    const snake = this.engine.snake;
    snake.segments.forEach((seg, i) => {
      const mesh = new THREE.Mesh(
        this.snakeGeometry,
        i === 0 ? this.snakeHeadMaterial : this.snakeMaterial
      );
      const pos = this.gridToWorld(seg.pos.x, seg.pos.y);
      mesh.position.copy(pos);

      const scale = i === 0 ? 1.1 : 1 - (i * 0.01);
      mesh.scale.set(Math.max(scale, 0.5), Math.max(scale, 0.5), 1);

      this.cubeGroup.add(mesh);
      this.snakeMeshes.push(mesh);
    });

    const state = this.engine.getState();
    const activeFace = this.engine.getActiveFace();

    this.engine.food.forEach(f => {
      if (f.type === FoodType.Dimensional && f.dimensionalFaces && !f.dimensionalFaces.includes(activeFace)) {
        return;
      }

      let color = COLORS.food;
      if (f.type === FoodType.TimeLimited) color = COLORS.foodTimeLimited;
      else if (f.type === FoodType.Dimensional) color = COLORS.foodDimensional;

      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.3,
      });

      const mesh = new THREE.Mesh(this.foodGeometry, material);
      const pos = this.gridToWorld(f.pos.x, f.pos.y);
      mesh.position.copy(pos);

      const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.15;
      mesh.scale.setScalar(pulse);

      if (f.type === FoodType.TimeLimited && f.spawnTime && f.timeLimit) {
        const remaining = 1 - (performance.now() - f.spawnTime) / f.timeLimit;
        material.opacity = Math.max(remaining, 0.2);
        material.transparent = true;
      }

      this.cubeGroup.add(mesh);
      this.foodMeshes.push(mesh);
    });

    const allWalls = this.engine.getAllWalls();
    allWalls.forEach(w => {
      const isFrame = this.engine.frameWalls.includes(w);
      const material = new THREE.MeshStandardMaterial({
        color: isFrame ? COLORS.frameWall : (w.isMoving ? COLORS.wallMoving : COLORS.wall),
        emissive: isFrame ? COLORS.boss : 0x000000,
        emissiveIntensity: isFrame ? 0.3 : 0,
        transparent: isFrame,
        opacity: isFrame ? 0.7 : 1,
      });
      const mesh = new THREE.Mesh(this.wallGeometry, material);
      const pos = this.gridToWorld(w.pos.x, w.pos.y);
      mesh.position.copy(pos);
      this.cubeGroup.add(mesh);
      this.wallMeshes.push(mesh);
    });

    if (state === GameState.Boss) {
      const hingeSegs = this.engine.getHingeSegments();
      hingeSegs.forEach((seg, i) => {
        const material = new THREE.MeshStandardMaterial({
          color: i === hingeSegs.length - 1 ? 0x00ff00 : COLORS.hinge,
          emissive: COLORS.hinge,
          emissiveIntensity: 0.4,
        });
        const mesh = new THREE.Mesh(this.snakeGeometry, material);
        const pos = this.gridToWorld(seg.pos.x, seg.pos.y);
        mesh.position.copy(pos);
        this.cubeGroup.add(mesh);
        this.hingeMeshes.push(mesh);
      });
    }
  }

  handleResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.engine.removeEventListener(this.handleGameEvent);
    this.clearFaceMeshes();
    this.snakeGeometry.dispose();
    this.snakeMaterial.dispose();
    this.snakeHeadMaterial.dispose();
    this.foodGeometry.dispose();
    this.wallGeometry.dispose();
    if (this.particleSystem) {
      this.particleSystem.geometry.dispose();
      (this.particleSystem.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
