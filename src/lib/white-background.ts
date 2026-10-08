/** Remove near-white pixels connected to the image edges, preserving enclosed whites. */
export function removeWhiteBackground(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  tolerance = 24
): Uint8ClampedArray<ArrayBuffer> {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > 16_000_000 ||
    pixels.length !== width * height * 4
  ) {
    throw new Error("Use an image with up to 16 million pixels.");
  }
  const strength = Number.isFinite(tolerance) ? Math.max(0, Math.min(100, tolerance)) : 24;
  const feather = 12;
  const output = new Uint8ClampedArray(pixels);
  const visited = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let head = 0;
  let tail = 0;
  const visit = (index: number) => {
    if (visited[index]) return;
    visited[index] = 1;
    const offset = index * 4;
    const distance = 255 - Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    if (pixels[offset + 3] === 0 || distance < strength + feather) queue[tail++] = index;
  };
  for (let x = 0; x < width; x++) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    visit(y * width);
    visit(y * width + width - 1);
  }
  while (head < tail) {
    const index = queue[head++];
    const offset = index * 4;
    const distance = 255 - Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    const opacity = Math.max(0, Math.min(1, (distance - strength) / feather));
    output[offset + 3] = Math.round(pixels[offset + 3] * opacity);
    if (opacity > 0 && opacity < 1) {
      for (let channel = 0; channel < 3; channel++) {
        output[offset + channel] = (pixels[offset + channel] - 255 * (1 - opacity)) / opacity;
      }
    }
    const x = index % width;
    if (x > 0) visit(index - 1);
    if (x < width - 1) visit(index + 1);
    if (index >= width) visit(index - width);
    if (index < width * (height - 1)) visit(index + width);
  }
  return output;
}
