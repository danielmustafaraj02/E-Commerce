import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  WebGLRenderer,
  type Material,
} from "three";

// The 3D gift card, built in code: a rounded board of card stock with the
// printed front and back as canvas textures (lib/gift-card-canvas.ts). Loaded
// on demand by components/gift-card-3d.tsx, so three.js never reaches pages
// that don't show it.
//
// On first reveal it glides in from a distant tilt, grows to scale, and lifts
// into place. It turns over on request (the "See the back" button calls
// flip()) and renders only during those two animations.

const CARD_W = 1;
const CARD_H = 1.25; // 4:5, like the printed card
const THICKNESS = 0.014;
const RADIUS = 0.012;

function roundedRect(w: number, h: number, r: number) {
  const shape = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

// ShapeGeometry's UVs are shape coordinates; map them onto the whole texture.
function faceGeometry(shape: Shape) {
  const geometry = new ShapeGeometry(shape, 6);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, position.getX(i) / CARD_W + 0.5, position.getY(i) / CARD_H + 0.5);
  }
  return geometry;
}

function texture(canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return map;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export type CardScene = {
  setFaces: (front: HTMLCanvasElement, back: HTMLCanvasElement, backEdge: string) => void;
  flip: () => void;
  dispose: () => void;
};

export function mountCardScene(
  container: HTMLElement,
  options: { reducedMotion: boolean; onFaceChange?: (showingBack: boolean) => void }
): CardScene {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "gc3d-canvas";
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 3);

  const shape = roundedRect(CARD_W, CARD_H, RADIUS);
  const card = new Group();
  scene.add(card);

  // Unlit, so a face turned to the viewer shows exactly the printed colours;
  // shade() darkens it as it turns away, which is all the lighting a flat
  // card needs.
  const frontMaterial = new MeshBasicMaterial();
  const backMaterial = new MeshBasicMaterial();
  const edgeColour = new Color("#ece4d5");
  const edgeMaterial = new MeshBasicMaterial({ color: edgeColour.clone() });
  const hiddenCaps = new MeshBasicMaterial({ visible: false });
  const shade = (facing: number) => 0.74 + 0.26 * Math.max(0, facing) ** 0.6;

  const front = new Mesh(faceGeometry(shape), frontMaterial);
  front.position.z = THICKNESS / 2 + 0.0005;
  const back = new Mesh(faceGeometry(shape), backMaterial);
  back.rotation.y = Math.PI;
  back.position.z = -THICKNESS / 2 - 0.0005;
  const edgeGeometry = new ExtrudeGeometry(shape, {
    depth: THICKNESS,
    bevelEnabled: false,
    curveSegments: 6,
  });
  edgeGeometry.translate(0, 0, -THICKNESS / 2);
  // Group 0 is the caps (covered by the printed faces), group 1 the sides.
  const edge = new Mesh(edgeGeometry, [hiddenCaps, edgeMaterial]);
  card.add(edge, front, back);

  // -- Turning over ------------------------------------------------------------
  let angle = 0; // around Y: 0 is the front, π the back
  let showingBack = false;
  let turn: { from: number; to: number; start: number } | null = null;
  let entrance: { start: number } | null = null;
  let entrancePlayed = false;
  const TURN_MS = options.reducedMotion ? 0 : 1100;
  const ENTRANCE_MS = options.reducedMotion ? 0 : 2300;

  const draw = () => {
    card.rotation.y = angle;
    frontMaterial.color.setScalar(shade(Math.cos(angle)));
    backMaterial.color.setScalar(shade(-Math.cos(angle)));
    edgeMaterial.color.copy(edgeColour).multiplyScalar(0.62 + 0.38 * Math.abs(Math.sin(angle)));
    renderer.render(scene, camera);
  };

  let frameId = 0;
  const tick = (now: number) => {
    frameId = 0;
    let changed = false;

    if (entrance) {
      const progress = Math.min((now - entrance.start) / ENTRANCE_MS, 1);
      // Give the card one complete turn while it rises in, then leave the
      // final quarter of the entrance for a clean, face-forward landing.
      const spinProgress = Math.min(progress / 0.76, 1);
      angle = Math.PI * 2 * easeInOut(spinProgress);
      if (progress < 0.74) {
        const t = easeOutCubic(progress / 0.74);
        card.scale.setScalar(0.24 + 0.86 * t);
        card.rotation.x = -0.66 * (1 - t) - 0.035 * t;
        card.rotation.z = 0.055 * (1 - t) - 0.025 * t;
        card.position.y = -0.24 * (1 - t) + 0.06 * t;
      } else {
        const t = easeInOut((progress - 0.74) / 0.26);
        card.scale.setScalar(1.1 - 0.1 * t);
        card.rotation.x = -0.035 * (1 - t);
        card.rotation.z = -0.025 * (1 - t);
        card.position.y = 0.06 * (1 - t);
      }
      changed = true;

      if (progress >= 1) {
        angle = 0;
        card.scale.setScalar(1);
        card.rotation.x = 0;
        card.rotation.z = 0;
        card.position.y = 0;
        entrance = null;
      }
    }

    if (turn) {
      const t = TURN_MS ? Math.min((now - turn.start) / TURN_MS, 1) : 1;
      angle = turn.from + (turn.to - turn.from) * easeInOut(t);
      changed = true;
      if (t >= 1) turn = null;
    }

    if (changed) draw();
    if (entrance || turn) frameId = requestAnimationFrame(tick);
  };

  const flip = () => {
    // A second press mid-turn turns it back from where it is.
    const from = angle;
    showingBack = !showingBack;
    turn = { from, to: showingBack ? Math.PI : 0, start: performance.now() };
    options.onFaceChange?.(showingBack);
    if (!frameId) frameId = requestAnimationFrame(tick);
  };

  // -- Size ----------------------------------------------------------------------
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the card with a little room around it for the turn.
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const fitHeight = (CARD_H * 1.16) / 2 / tan;
    const fitWidth = (CARD_W * 1.16) / 2 / tan / camera.aspect;
    camera.position.z = Math.max(fitHeight, fitWidth);
    camera.updateProjectionMatrix();
    draw();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  return {
    setFaces(frontCanvas, backCanvas, backEdge) {
      frontMaterial.map?.dispose();
      backMaterial.map?.dispose();
      frontMaterial.map = texture(frontCanvas, renderer);
      backMaterial.map = texture(backCanvas, renderer);
      frontMaterial.needsUpdate = true;
      backMaterial.needsUpdate = true;
      edgeColour.set(backEdge);
      if (!entrancePlayed) {
        entrancePlayed = true;
        if (ENTRANCE_MS) {
          card.scale.setScalar(0.24);
          card.rotation.x = -0.66;
          card.rotation.z = 0.055;
          card.position.y = -0.24;
          entrance = { start: performance.now() };
          if (!frameId) frameId = requestAnimationFrame(tick);
        }
      }
      draw();
    },
    flip,
    dispose() {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      for (const mesh of [front, back, edge]) mesh.geometry.dispose();
      for (const material of [frontMaterial, backMaterial, edgeMaterial, hiddenCaps] as Material[]) {
        (material as MeshBasicMaterial).map?.dispose();
        material.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
