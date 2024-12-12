import { useState } from "preact/hooks";
import { ColorButton } from "./ColorButton";

export function ColorMatrix({ colors, grid, initialPositions }) {
  const [positions, setPositions] = useState(initialPositions);
  const [clickedColor, setClickedColor] = useState(null);

  function colorClick(color) {
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
  }

  function switchPositions(color1, color2) {
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
  }

  let correctPositions = 0;
  positions.forEach((position, i) => {
    if (position == i) {
      correctPositions++;
    }
  });

  return (
    <>
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
    </>
  );
}
