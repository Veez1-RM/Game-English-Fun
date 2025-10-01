export function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function scrambleWord(word) {
  // scramble letters but avoid returning same order
  let letters = word.split('');
  let scrambled = shuffleArray(letters).join('');
  // if scramble equals original, shuffle again a few times
  let tries = 0;
  while (scrambled.toLowerCase() === word.toLowerCase() && tries < 10) {
    scrambled = shuffleArray(letters).join('');
    tries++;
  }
  // format with spaces between letters for readability
  return scrambled.split('').join(' ');
}
