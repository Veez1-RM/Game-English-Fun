// utils/sound.js
export function playSound(src, volume = 1) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(e => console.error('Audio play failed:', e));
}
