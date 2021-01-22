// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg
let imgIn; // Image to be used
const matrix = [
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
  [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64]
]; // Matrix for radial blur

/**
 * P5 preload functionality
 *
 * @return void.
 */
function preload () {
  imgIn = loadImage('assets/husky.jpg');
}

/**
 * P5 setup functionality
 *
 * @return void.
 */
function setup() {
    createCanvas((imgIn.width * 2), imgIn.height);
    pixelDensity(1);
}

/**
 * P5 draw functionality
 *
 * @return void.
 */
function draw () {
    background(125);
    image(imgIn, 0, 0);
    image(earlyBirdFilter(imgIn), imgIn.width, 0);
    noLoop();
}

/**
 * P5 event listener - mouse pressed
 *
 * @return void.
 */
function mousePressed () {
  loop();
}

/**
 * Brings all the filters together, adding one on top of another
 *
 * @param {image} img - The image to apply the filters to
 * 
 * @return {image} - The final image to render
 */
function earlyBirdFilter (img) {
  let resultImg = createImage(imgIn.width, imgIn.height);
  resultImg = sepiaFilter(imgIn);
  resultImg = darkCorners(resultImg);
  resultImg = radialBlurFilter(resultImg);
  resultImg = borderFilter(resultImg)
  return resultImg;
}

/**
 * Creates a sepia filter
 *
 * @param {image} img - The image to apply the filter to
 * 
 * @return {image} - The image with the sepia filter
 */
function sepiaFilter (img) {
  const imgOut = createImage(img.width, img.height);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let i = 0, x = img.width; i < x; i++) {
    for (let j = 0, y = img.height; j < y; j++) {
      const pixel = ((img.width * j) + i) * 4;
      // Get channels from original pic
      const redC = img.pixels[pixel];
      const greenC = img.pixels[pixel + 1];
      const blueC = img.pixels[pixel + 2];
      // Convert and constrain channels for new image
      imgOut.pixels[pixel] = constrain((redC * .393) + (greenC * .769) + (blueC * .189), 0, 255);
      imgOut.pixels[pixel + 1] = constrain((redC * .349) + (greenC * .686) + (blueC * .168), 0, 255);
      imgOut.pixels[pixel + 2] = constrain((redC * .272) + (greenC * .534) + (blueC * .131), 0, 255);
      imgOut.pixels[pixel + 3] = 255;
    }
  }
  // Update
  imgOut.updatePixels();
  return imgOut;
}

/**
 * Adds dark corners to an image
 *
 * @param {image} img - The image to apply the corners to
 * 
 * @return {image} - The image with the fark corners
 */
function darkCorners (img) {
  const imgOut = createImage(img.width, img.height);
  // Get the coords of the centre pixel

  // #########################
  // #########################
  // TODO - User hypotenuse to calculate max distance?
  // #########################
  // #########################

  const centrePixel = {
    x: img.width / 2,
    y: img.height /2
  };
  // Calculate the furthest distance possible from the centre pixel
  const maxDistance = dist(0, 0, centrePixel.x, centrePixel.y);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let i = 0, x = img.width; i < x; i++) {
    for (let j = 0, y = img.height; j < y; j++) {
      const pixel = ((img.width * j) + i) * 4;
      // Calculate distance from centre
      const distance = dist(i, j, centrePixel.x, centrePixel.y);
      // Store the scale factor
      let dynLum = 1
      // From 300 to 450
      if (distance >= 300 && distance < 450 ) {
        dynLum = map(distance, 300, 449, 1, 0.4);
      }
      // From 450 to the max possible distance
      if (distance >= 450) {
        dynLum = map(distance, 451, maxDistance, 0.4, 0);
      }
      // Scale the channels
      imgOut.pixels[pixel] = constrain(img.pixels[pixel] * dynLum, 0, 255);
      imgOut.pixels[pixel + 1] = constrain(img.pixels[pixel + 1] * dynLum, 0, 255);
      imgOut.pixels[pixel + 2] = constrain(img.pixels[pixel + 2] * dynLum, 0, 255);
      imgOut.pixels[pixel + 3] = 255;
    }
  }
  // Update
  imgOut.updatePixels();
  return imgOut;
}

/**
 * Adds a radial blur filter from mouse position
 *
 * @param {image} img - The image to apply the filter to
 * 
 * @return {image} - The image with the radial blur filter
 */
function radialBlurFilter (img) {
  const imgOut = createImage(img.width, img.height);
  const matrixSize = matrix.length;

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let x = 0, i = img.width; x < i; x++) {
    for (let y = 0, j = img.height; y < j; y++) {
      const pixel = ((img.width * y) + x) * 4;
      // Get channels from original pic
      const r = img.pixels[pixel];
      const g = img.pixels[pixel + 1];
      const b = img.pixels[pixel + 2];
      // Calculate distance from mouse
      let distance = dist(x, y, mouseX, mouseY);
      // Initial blur value (don't blur)
      let dynBlur = 0;
      // If between 100 and 300, starting blurring
      if (distance > 100 && distance <= 300) {
        dynBlur = constrain(map(distance, 100, 300, 0, 1), 0, 1);
      }
      // If more than 300, completely blur
      if (distance > 300) {
        dynBlur = 1;
      }
      // Determine convolution
      const c = convolution(x, y, matrix, matrixSize, img);
      // Generate new channel
      imgOut.pixels[pixel] = c[0] * dynBlur + r * (1 - dynBlur);
      imgOut.pixels[pixel + 1] = c[1] * dynBlur + g * (1 - dynBlur);
      imgOut.pixels[pixel + 2] = c[2] * dynBlur + b * (1 - dynBlur);
      imgOut.pixels[pixel + 3] = 255;
    }
  }
  // Update
  imgOut.updatePixels();
  return imgOut;
}

/**
 * Adds a border to an image
 *
 * @param {image} img - The image to apply the border to
 * 
 * @return {image} - The image with the border
 */
function borderFilter (img) {
  let buffer = createGraphics(img.width, img.height);
  const cornerSize = 40;
  const borderSize = 20;
  // Draw image
  buffer.image(img, 0, 0);
  // Draw image frame
  buffer.noFill();
  buffer.strokeWeight(borderSize);
  buffer.stroke(255);
  buffer.rect(
    0 + borderSize / 2,
    0 + borderSize / 2,
    img.width - borderSize,
    img.height - borderSize,
    cornerSize,
    cornerSize,
    cornerSize,
    cornerSize
  );
  // Remove corners
  buffer.strokeWeight(borderSize * 2);
  buffer.rect(0, 0, img.width, img.height);
  return buffer;
}

/**
 * Calculates convolution
 *
 * @param {number} x - The x position of the pixel
 * @param {number} y - The y position of the pixel
 * @param {array array} matrix - The matrix to use
 * @param {number} matrixSize - The size of the passed matrix
 * @param {image} img - The image to use
 * 
 * @return {number array} - An array containing the red, green and blue channels
 */
function convolution (x, y, matrix, matrixSize, img) {
  let red = 0;
  let green = 0;
  let blue = 0;
  // Offset
  const offset = floor(matrixSize / 2);

  for (let i = 0; i < matrixSize; i++) {
    for (let j = 0; j < matrixSize; j++) {
      const xPos = x + i - offset;
      const yPos = y + j - offset;

      let pixel = ((img.width * yPos) + xPos) * 4;
      pixel = constrain(pixel, 0, img.pixels.length - 1);

      red += img.pixels[pixel] * matrix[i][j];
      green += img.pixels[pixel + 1] * matrix[i][j];
      blue += img.pixels[pixel + 2] * matrix[i][j];
    }
  }
  return [red, green, blue];
}

