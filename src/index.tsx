import { render } from "preact";

import { interpolate, samples, formatHex, clampChroma } from "culori";
import { shuffle } from "./helpers";
import { ColorMatrix } from "./ColorMatrix";

import "./style.css";

const WIDTH = 5;
const HEIGHT = 6;

const FIXED_POSITIONS = [
  0,
  WIDTH - 1,
  WIDTH * HEIGHT - WIDTH,
  WIDTH * HEIGHT - 1,
];

export function App() {
  const lightnessStart = 85;
  const lightnessEnd = 45;
  const lightnessCenter = (lightnessStart + lightnessEnd) / 2;

  const chromaStart = 0.1;
  const chromaEnd = 0.25;
  const chromaCenter = (chromaStart + chromaEnd) / 2;

  const hueStart = 260;
  const hueEnd = 350;
  const hueCenter = (hueStart + hueEnd) / 2;

  const topleft = `oklch(${lightnessStart}% ${chromaStart} ${hueStart})`;
  const topright = `oklch(${lightnessCenter}% ${chromaCenter} ${hueStart})`;
  const bottomleft = `oklch(${lightnessEnd}% ${chromaCenter} ${hueCenter})`;
  const bottomright = `oklch(${lightnessEnd}% ${chromaEnd} ${hueEnd})`;

  const firstcolumn = getGradientColors(topleft, bottomleft, HEIGHT);
  const lastcolumn = getGradientColors(topright, bottomright, HEIGHT);

  const colors = [];
  const grid = {};

  let colorId = 0;
  for (let i = 0; i < HEIGHT; i++) {
    const rowcolors = getGradientColors(firstcolumn[i], lastcolumn[i], WIDTH);
    for (let j = 0; j < WIDTH; j++) {
      const color = rowcolors[j];
      const clampedColor = clampChroma(color);
      colors.push({
        hex: formatHex(clampedColor),
        colorId: colorId,
        fixed: FIXED_POSITIONS.includes(colorId) ? true : false,
      });
      grid[colorId] = {
        x: j,
        y: i,
      };
      colorId += 1;
    }
  }

  const initialPositions = JSON.parse(JSON.stringify(Object.keys(grid)));
  shuffle(initialPositions, FIXED_POSITIONS);

  const containerStyles = {
    gridTemplateColumns: `repeat(${WIDTH}, 1fr)`,
    gridTemplateRows: `repeat(${HEIGHT}, 1fr)`,
  };

  return (
    <main style={containerStyles}>
      <ColorMatrix
        colors={colors}
        grid={grid}
        initialPositions={initialPositions}
      />
    </main>
  );
}

render(<App />, document.getElementById("app"));

function getGradientColors(start, slutt, steps) {
  const gradient = interpolate([start, slutt], "oklch");
  const colors = samples(steps).map(gradient);
  return colors;
}
