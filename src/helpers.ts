
export function shuffle(array, fixedPositions) {
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
