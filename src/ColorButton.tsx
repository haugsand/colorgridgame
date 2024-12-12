import { useState } from "preact/hooks";

export function ColorButton({
  color,
  colorClick,
  position,
  clickedColor,
  switchPositions,
}) {
  const [isDragged, setIsDragged] = useState(false);

  function dragStart(event, color) {
    event.dataTransfer.setData("text/plain", color.colorId);
    event.dataTransfer.effectAllowed = "move";

    const width = event.target.offsetWidth;
    const height = event.target.offsetHeight;

    const canvas = document.createElement("canvas");
    document.body.append(canvas);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color.hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    event.dataTransfer.setDragImage(canvas, event.offsetX, event.offsetY);
    setIsDragged(true);
  }

  function dragOver(event) {
    event.preventDefault();
  }
  function dragEnd() {
    setIsDragged(false);
  }

  function drop(event, color) {
    event.preventDefault();
    const draggedColor = event.dataTransfer.getData("text/plain");
    const dropTarget = color.colorId;

    if (draggedColor != dropTarget) {
      switchPositions(draggedColor, dropTarget);
      const animation = [{ opacity: 0 }, { opacity: 1 }];

      const timing = {
        duration: 50,
        iterations: 1,
      };

      event.target.animate(animation, timing);
    }
  }

  let backgroundColor = color.hex;
  if (isDragged) {
    backgroundColor = "black";
  }

  const style = {
    backgroundColor: backgroundColor,
    gridColumnStart: position.x + 1,
    gridRowStart: position.y + 1,
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
