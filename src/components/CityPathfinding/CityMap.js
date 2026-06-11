export const TILE = {
  ROAD: 'ROAD',
  INTERSECTION: 'INTERSECTION',
  BUILDING: 'BUILDING',
  PARK: 'PARK',
  TRAFFIC: 'TRAFFIC',
  LANDMARK: 'LANDMARK',
  WATER: 'WATER',
  BRIDGE: 'BRIDGE',
};

export const LANDMARKS = [
  { id: 'hospital', name: 'Hospital', row: 2, col: 4, icon: '🏥' },
  { id: 'school', name: 'School', row: 2, col: 24, icon: '🏫' },
  { id: 'station', name: 'Train Station', row: 14, col: 10, icon: '🚉' },
  { id: 'mall', name: 'Shopping Mall', row: 14, col: 34, icon: '🏬' },
  { id: 'park_main', name: 'Central Park', row: 8, col: 20, icon: '🌳' },
  { id: 'airport', name: 'Airport', row: 26, col: 6, icon: '✈️' },
  { id: 'university', name: 'University', row: 26, col: 28, icon: '🎓' },
  { id: 'police', name: 'Police Station', row: 8, col: 44, icon: '🚔' },
  { id: 'stadium', name: 'Stadium', row: 20, col: 18, icon: '🏟️' },
  { id: 'library', name: 'Library', row: 20, col: 40, icon: '📚' },
];

export const ROWS = 30;
export const COLS = 50;

export const getInitialCityMap = () => {
  const grid = [];
  const horizontalRoads = new Set([2, 8, 14, 20, 26]);
  const verticalRoads = new Set([4, 10, 18, 24, 28, 34, 40, 44]);

  for (let r = 0; r < ROWS; r++) {
    const currentRow = [];
    for (let c = 0; c < COLS; c++) {
      const isHoriz = horizontalRoads.has(r);
      const isVert = verticalRoads.has(c);

      if (isHoriz && isVert) {
        currentRow.push(TILE.INTERSECTION);
      } else if (isHoriz || isVert) {
        currentRow.push(TILE.ROAD);
      } else {
        currentRow.push(TILE.BUILDING);
      }
    }
    grid.push(currentRow);
  }

  // Add Parks
  const setRect = (rStart, rEnd, cStart, cEnd, type) => {
    for (let r = rStart; r <= rEnd; r++) {
      for (let c = cStart; c <= cEnd; c++) {
        if (!horizontalRoads.has(r) && !verticalRoads.has(c)) {
          grid[r][c] = type;
        }
      }
    }
  };

  // Park 1
  setRect(9, 13, 19, 23, TILE.PARK);
  // Park 2
  setRect(3, 7, 5, 9, TILE.PARK);
  // Park 3
  setRect(21, 25, 35, 39, TILE.PARK);

  // Add Traffic Zones (near center)
  setRect(12, 13, 25, 27, TILE.TRAFFIC);
  setRect(15, 16, 25, 27, TILE.TRAFFIC);
  setRect(15, 16, 21, 23, TILE.TRAFFIC);
  setRect(12, 13, 21, 23, TILE.TRAFFIC);
  // Also put some traffic on roads themselves near the center
  for (let c = 21; c <= 27; c++) {
    if (grid[14][c] === TILE.ROAD) grid[14][c] = TILE.TRAFFIC;
  }
  for (let r = 12; r <= 16; r++) {
    if (grid[r][24] === TILE.ROAD) grid[r][24] = TILE.TRAFFIC;
  }

  // Add deterministic winding river
  const riverOffsets = [0, 0, 0, -1, -1, -1, -2, -2, -2, -3, -3, -3, -3, -2, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];
  for (let r = 0; r < ROWS; r++) {
    const startCol = 30 + riverOffsets[r];
    for (let w = 0; w < 3; w++) {
      let c = startCol + w;
      if (c >= 0 && c < COLS) {
        if (grid[r][c] === TILE.ROAD || grid[r][c] === TILE.INTERSECTION) {
          grid[r][c] = TILE.BRIDGE;
        } else {
          grid[r][c] = TILE.WATER;
        }
      }
    }
  }

  // Add Landmarks (Landmarks should sit on top of ROADs or INTERSECTIONs, 
  // but to keep logic simple, they just become LANDMARK tile type, 
  // but we will render them as road beneath them via CSS)
  LANDMARKS.forEach(lm => {
    grid[lm.row][lm.col] = TILE.LANDMARK;
  });

  return grid;
};
