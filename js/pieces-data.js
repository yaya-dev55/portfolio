// Shared metadata for each piece — used by the hero scene (hover panel)
// and by work/piece.html (detail page), so copy only needs editing once.

export const PIECES = [
  {
    id: 'necklace',
    file: 'necklace.glb',
    name: 'Necklace',
    tagline: 'A sculptural necklace built around the collarbone and throat.',
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
    flip: true,
  },
  {
    id: 'front_piece',
    file: 'front_piece.glb',
    name: 'Front Piece',
    tagline: 'A frontal body ornament designed to sit at the sternum.',
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
    flip: true,
  },
  {
    id: 'waist',
    file: 'waist.glb',
    name: 'Waist Piece',
    tagline: "A waist piece that wraps the body as structural ornament.",
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
    flip: true,
  },
  {
    id: 'leg1',
    file: 'leg1.glb',
    name: 'Leg Piece',
    tagline: "A leg-worn piece extending the body's silhouette downward.",
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
    yaw: Math.PI,
  },
  {
    id: 'bracelet',
    file: 'bracelet.glb',
    name: 'Bracelet',
    tagline: 'An articulated bracelet built from repeating linked segments.',
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
    yaw: Math.PI,
  },
  {
    id: 'bangle',
    file: 'bangle.glb',
    name: 'Bangle — Form I',
    tagline: 'A rigid, single-cast bangle exploring continuous closed-loop form.',
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
  },
  {
    id: 'bangle_02',
    file: 'bangle_02.glb',
    name: 'Bangle — Form II',
    tagline: 'A second study in bangle form, with softer curvature and a thinner profile.',
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
  },
  {
    id: 'bangle_03',
    file: 'bangle_03.glb',
    name: 'Bangle — Form III',
    tagline: 'A third bangle iteration — more angular and structural.',
    medium: '3D modeling / digital sculpture',
    status: 'In progress — 2026',
    flip: true,
  },
];

export function getPiece(id) {
  return PIECES.find((p) => p.id === id) || null;
}
