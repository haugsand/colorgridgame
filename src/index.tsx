import { render } from "preact";
import { useState } from "preact/hooks";
import { interpolate, samples, formatHex, clampChroma } from "culori";

import "./style.css";

const WIDTH = 7;
const HEIGHT = 5;

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
  const hueEnd = 330;
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

  return (
    <ColorMatrix
      colors={colors}
      grid={grid}
      initialPositions={initialPositions}
    />
  );
}

render(<App />, document.getElementById("app"));

function getGradientColors(start, slutt, steps) {
  const gradient = interpolate([start, slutt], "oklch");
  const colors = samples(steps).map(gradient);
  return colors;
}

function ColorMatrix({ colors, grid, initialPositions }) {
  const [positions, setPositions] = useState(initialPositions);
  const [clickedColor, setClickedColor] = useState(null);

  const containerStyles = {
    gridTemplateColumns: `repeat(${WIDTH}, 1fr)`,
    gridTemplateRows: `repeat(${HEIGHT}, 1fr)`,
  };

  const colorClick = (color) => {
    if (clickedColor) {
      if (clickedColor != color.colorId) {
        const nextPositions = positions.map((position, i) => {
          if (i === clickedColor) {
            return positions[color.colorId];
          } else if (i === color.colorId) {
            return positions[clickedColor];
          } else {
            return position;
          }
        });
        setPositions(nextPositions);
      }
      setClickedColor(null);
    } else {
      setClickedColor(color.colorId);
    }
  };

  const switchPositions = (color1, color2) => {
    const nextPositions = positions.map((position, i) => {
      if (i == color1) {
        return positions[color2];
      } else if (i == color2) {
        return positions[color1];
      } else {
        return position;
      }
    });
    setPositions(nextPositions);
  };

  let correctPositions = 0;
  positions.forEach((position, i) => {
    if (position == i) {
      correctPositions++;
    }
  });

  return (
    <main style={containerStyles}>
      {colors.map((color) => (
        <ColorButton
          color={color}
          position={grid[positions[color.colorId]]}
          colorClick={colorClick}
          switchPositions={switchPositions}
          clickedColor={clickedColor}
          key={color.colorId}
        />
      ))}
      {correctPositions === positions.length ? <p>Hurra</p> : null}
    </main>
  );
}

function ColorButton({
  color,
  colorClick,
  position,
  clickedColor,
  switchPositions,
}) {
	const [isDragged, setIsDragged] = useState(false);

  const buttonWidth = (1 / WIDTH) * 100;
  const buttonHeight = (1 / HEIGHT) * 100;


  const dragStart = (event, color) => {
    event.dataTransfer.setData("text/plain", color.colorId);
		event.dataTransfer.effectAllowed = "move";
		setIsDragged(true);
  };

  const dragOver = (event) => {
    event.preventDefault();
  };
  const dragEnd = () => {
		setIsDragged(false);
  };

  const drop = (event, color) => {
    event.preventDefault();
    const draggedColor = event.dataTransfer.getData("text/plain");
    const dropTarget = color.colorId;

    if (draggedColor != dropTarget) {
      switchPositions(draggedColor, dropTarget);
    }
  };


	let backgroundColor = color.hex;
	if (isDragged) {
		backgroundColor = color.hex;
	}

	const style = {
    backgroundColor: backgroundColor,
    height: `${buttonHeight}%`,
    width: `${buttonWidth}%`,
    left: `${buttonWidth * position.x}%`,
    top: `${buttonHeight * position.y}%`,
  };

  return (
    <button
      style={style}
      onClick={() => colorClick(color)}
      disabled={color.fixed}
      draggable={!color.fixed}
      onDragStart={(event) => dragStart(event, color)}
      onDragOver={(event) => dragOver(event)}
      onDrop={(event) => drop(event, color)}
			onDragEnd={dragEnd}
      aria-pressed={clickedColor === color.colorId}
    ></button>
  );
}

function shuffle(array, fixedPositions) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  // Unshuffle fixed positions
  fixedPositions.forEach((position) => {
    const randomPosition = array.indexOf(position.toString());
    [array[position], array[randomPosition]] = [
      array[randomPosition],
      array[position],
    ];
  });
}
