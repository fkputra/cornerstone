import now from './now';

/**
 * This function transforms stored pixel values into a canvas image data buffer
 * by using a LUT.  This is the most performance sensitive code in cornerstone and
 * we use a special trick to make this go as fast as possible.  Specifically we
 * use the alpha channel only to control the luminance rather than the red, green and
 * blue channels which makes it over 3x faster.  The canvasImageDataData buffer needs
 * to be previously filled with white pixels.
 *
 * NOTE: Attribution would be appreciated if you use this technique!
 *
 * @param image
 * @param lut
 * @param canvasImageDataData canvasImageData.data buffer filled with white pixels
 */
export default function (image, lut, canvasImageDataData) {
  const pixelData = image.getPixelData();
  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 3;
  let storedPixelDataIndex = 0;
  const numPixels = pixelData.length;

  let start = now();

  image.stats.lastGetPixelDataTime = now() - start;

  start = now();
    // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
    // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement

    // Added two paths (Int16Array, Uint16Array) to avoid polymorphic deoptimization in chrome.
  if (pixelData instanceof Int16Array) {
    if (minPixelValue < 0) {
      while (storedPixelDataIndex < numPixels) {
        canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Alpha
        canvasImageDataIndex += 4;
      }
    } else {
      while (storedPixelDataIndex < numPixels) {
        canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // Alpha
        canvasImageDataIndex += 4;
      }
    }
  } else if (pixelData instanceof Uint16Array) {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // Alpha
      canvasImageDataIndex += 4;
    }
  } else if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Alpha
      canvasImageDataIndex += 4;
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // Alpha
      canvasImageDataIndex += 4;
    }
  }

  image.stats.laststoredPixelDataToCanvasImageDataTime = now() - start;
}
