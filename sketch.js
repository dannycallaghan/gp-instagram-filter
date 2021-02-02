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
let devMode = true; // If we're in dev mode, log analysis to the screen

let menuDiv;
//let filterColumn;
//let slidersDiv;
//let slidersInner;
//let colorAdjustColumn;
let menuDivRendered = false;
//let slidersDivRendered = false;
const body = document.body;
//let slidersButtons;

let filtersInner;
let colorAdjustInner;


const filtersData = [
  {
    index: 1,
    ref: 'sepia',
    label: `Sepia (press '1')`,
    _function: sepiaFilter,
    active: true,
    rendered: false,
    checkbox: null
  },
  {
    index: 2,
    ref: 'corners',
    label: `Dark corners (press '2')`,
    _function: darkCornersFilter,
    active: true,
    rendered: false,
    checkbox: null
  },
  {
    index: 3,
    ref: 'radial',
    label: `Radial blur (press '3')`,
    _function: radialBlurFilter,
    active: true,
    rendered: false,
    checkbox: null,
    matrix: [
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
      [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64]
    ]
  },
  {
    index: 4,
    ref: 'border',
    label: `Border (press '4')`,
    _function: borderFilter,
    active: true,
    rendered: false,
    checkbox: null
  },
  {
    index: 5,
    ref: 'sharpen',
    label: `Sharpen (press '5')`,
    _function: sharpenFilter,
    active: false,
    rendered: false,
    checkbox: null,
    matrix: [
      [-1, -1, -1],
      [-1, 9, -1],
      [-1, -1, -1]
    ]
  },
  {
    index: 6,
    ref: 'grayscale',
    label: `Grayscale (press '6')`,
    _function: grayscaleFilter,
    active: false,
    rendered: false,
    checkbox: null,
  },
  {
    index: 7,
    ref: 'invert',
    label: `Invert (press '7')`,
    _function: invertFilter,
    active: false,
    rendered: false,
    checkbox: null,
  },
  {
    index: 8,
    ref: 'emboss',
    label: `Emboss (press '8')`,
    _function: embossFilter,
    active: false,
    rendered: false,
    checkbox: null,
    matrix: [
      [-1, -1, -1, -1,  0],
      [-1, -1, -1,  0,  1],
      [-1, -1,  0,  1,  1],
      [-1,  0,  1,  1,  1],
      [0,  1,  1,  1,  1]
    ]
  }
];

const colorSliders = [
  {
    index: 0,
    label: 'Red channel',
    rendered: false,
    ref: 'red',
    slider: null
  },
  {
    index: 1,
    label: 'Green channel',
    rendered: false,
    ref: 'green',
    slider: null
  },
  {
    index: 2,
    label: 'Blue channel',
    rendered: false,
    ref: 'blue',
    slider: null
  }
]

let loadingDiv;
let loadingImg;
const loadingTimer = 500;

/**
 * P5 preload functionality
 *
 * @return void.
 */
function preload () {
  imgIn = loadImage('./assets/husky.jpg');
  loadingImg = loadImage('./assets/loader.gif');
}

/**
 * P5 setup functionality
 *
 * @return void.
 */
function setup() {
    createCanvas((imgIn.width * 2), imgIn.height);
    pixelDensity(1);

    loadingDiv = createDiv();
    loadingDiv.addClass('loading');
    //loadingDiv.addClass('active');

    const loader = createImg('./assets/loader.gif', 'generating image');
    loader.parent(loadingDiv);
}

/**
 * P5 draw functionality
 *
 * @return void.
 */
function draw () {
    background(125);

    drawMenu();

    colorSliders.forEach(slider => {
      drawSlider(slider);
    });

    image(imgIn, 0, 0);
    image(earlyBirdFilter(imgIn), imgIn.width, 0);

    filtersData.forEach(_filter => {
      drawCheckbox(_filter.ref, _filter.label);
    });

    noLoop();
}

/**
 * P5 event listener - mouse pressed
 *
 * @return void.
 */
function mousePressed () {
  if (mouseX < imgIn.width && mouseY < imgIn.height) {
    loop();
  }
}

/**
 * Brings all the filters together, adding one on top of another
 *
 * @param {image} img - The image to apply the filters to
 *
 * @return {image} - The final image to render
 */
function earlyBirdFilter (img) {
  loadingDiv.addClass('active');

  let resultImg = createImage(imgIn.width, imgIn.height);
  let filtered = imgIn;
  filtersData.forEach((f, i) => {
    if (f.active) {
      filtered = f._function(filtered);
    }
  });

  getChannelInfo(filtered);

  setTimeout(() => {
    loadingDiv.removeClass('active');
  }, loadingTimer);
  return filtered;
}

function getChannelInfo (img) {
  img.loadPixels();

  let redSum = 0;
  let greenSum = 0;
  let blueSum = 0;

  for (let i = 0, j = img.imageData.data.length; i < j; i += 4) {
    // Get channels
    const redC = img.pixels[i];
    const greenC = img.pixels[i + 1];
    const blueC = img.pixels[i + 2];

    // Sum channels
    redSum += redC;
    greenSum += greenC;
    blueSum += blueC;
  }

  setSliders(img, redSum, blueSum, greenSum);
}

/**
 * Creates a sepia filter
 *
 * @param {image} img - The image to apply the filter to
 *
 * @return {image} - The image with the sepia filter
 */
function sepiaFilter (img) {
  $timer('sepiaFilter', true);
  const imgOut = createImage(img.width, img.height);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let i = 0, j = imgOut.imageData.data.length; i < j; i += 4) {
    // Get channels
    const redC = img.pixels[i];
    const greenC = img.pixels[i + 1];
    const blueC = img.pixels[i + 2];

    // Convert and constrain channels for new image
    imgOut.pixels[i] = constrain((redC * .393) + (greenC * .769) + (blueC * .189), 0, 255);
    imgOut.pixels[i + 1] = constrain((redC * .349) + (greenC * .686) + (blueC * .168), 0, 255);
    imgOut.pixels[i + 2] = constrain((redC * .272) + (greenC * .534) + (blueC * .131), 0, 255);
    imgOut.pixels[i + 3] = 255;
  }

  // Update
  imgOut.updatePixels();
  $timer('sepiaFilter', false);
  return imgOut;
}

function setSliders (img, red, green, blue) {
  let redValue = round(map(red, 0, (img.imageData.data.length / 4) * 255, 0, 255));
  let greenValue = round(map(green, 0, (img.imageData.data.length / 4) * 255, 0, 255));
  let blueValue = round(map(blue, 0, (img.imageData.data.length / 4) * 255, 0, 255));

  colorSliders[0].slider.value(redValue);
  colorSliders[1].slider.value(greenValue);
  colorSliders[2].slider.value(blueValue);
}

/**
 * Adds dark corners to an image
 *
 * @param {image} img - The image to apply the corners to
 *
 * @return {image} - The image with the fark corners
 */
function darkCornersFilter (img) {
  $timer('darkCorners', true);
  const imgOut = createImage(img.width, img.height);
  // Get the coords of the centre pixel
  const centrePixel = {
    x: img.width / 2,
    y: img.height / 2
  };
  // Calculate the furthest distance possible from the centre pixel
  const maxDistance = dist(0, 0, centrePixel.x, centrePixel.y);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  const largestDimension = max(img.width, img.height);
  const allPixels = pow(largestDimension, 2);
  for (let i = 0, j = allPixels; i < j; i++) {
    const x = floor(i / largestDimension); // X pixels
    const y = i % largestDimension; // Y pixels
    const pixel = ((img.width * y) + x) * 4; // Get pixel array

    // Calculate distance from centre
    const distance = dist(x, y, centrePixel.x, centrePixel.y);
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

  // Update
  imgOut.updatePixels();
  $timer('darkCorners', false);
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
  $timer('radialBlurFilter', true);
  const imgOut = createImage(img.width, img.height);
  const matrix = getfiltersDataValue('radial', 'matrix')
  const matrixSize = matrix.length;

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  const largestDimension = max(img.width, img.height);
  const allPixels = pow(largestDimension, 2);
  for (let i = 0, j = allPixels; i < j; i++) {
    const x = floor(i / largestDimension); // X pixels
    const y = i % largestDimension; // Y pixels
    const pixel = ((img.width * y) + x) * 4; // Get pixel array
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

  // Update
  imgOut.updatePixels();
  $timer('radialBlurFilter', false);
  return imgOut;

}

function applyFilterFromMatrix (img, matrix) {

  const imgOut = createImage(img.width, img.height);
  const matrixSize = matrix.length;

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  const largestDimension = max(img.width, img.height);
  const allPixels = pow(largestDimension, 2);
  for (let i = 0, j = allPixels; i < j; i++) {
    const x = floor(i / largestDimension); // X pixels
    const y = i % largestDimension; // Y pixels
    const pixel = ((img.width * y) + x) * 4; // Get pixel array
    // Get channels from original pic
    const r = img.pixels[pixel];
    const g = img.pixels[pixel + 1];
    const b = img.pixels[pixel + 2];

    // Determine convolution
    const c = convolution(x, y, matrix, matrixSize, img);
    // Generate new channel
    imgOut.pixels[pixel] = c[0] + r;
    imgOut.pixels[pixel + 1] = c[1] + g;
    imgOut.pixels[pixel + 2] = c[2] + b;
    imgOut.pixels[pixel + 3] = 255;

  }

  // Update
  imgOut.updatePixels();

  return imgOut;

}


function sharpenFilter (img) {
  $timer('sharpenFilter', true);
  const imgOut = applyFilterFromMatrix(img, getfiltersDataValue('sharpen', 'matrix'))
  $timer('sharpenFilter', false);
  return imgOut;
}

function embossFilter (img) {
  $timer('embossFilter', true);
  const imgOut = applyFilterFromMatrix(img, getfiltersDataValue('emboss', 'matrix'))
  $timer('embossFilter', false);
  return imgOut;
}


function grayscaleFilter (img) {

  $timer('grayscaleFilter', true);
  const imgOut = createImage(img.width, img.height);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let i = 0, j = imgOut.imageData.data.length; i < j; i+=4) {
    // Get channels
    const redC = img.pixels[i];
    const greenC = img.pixels[i + 1];
    const blueC = img.pixels[i + 2];

    const aphaChannel = 0.3 * redC + 0.59 * greenC + 0.11 * blueC;

    // Convert and constrain channels for new image
    imgOut.pixels[i] = constrain(aphaChannel, 0, 255);
    imgOut.pixels[i + 1] = constrain(aphaChannel, 0, 255);
    imgOut.pixels[i + 2] = constrain(aphaChannel, 0, 255);
    imgOut.pixels[i + 3] = 255;

  }

  // Update
  imgOut.updatePixels();
  $timer('grayscaleFilter', false);
  return imgOut;

}

function invertFilter (img) {

  $timer('invertFilter', true);
  const imgOut = createImage(img.width, img.height);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let i = 0, j = imgOut.imageData.data.length; i < j; i+=4) {
    // Get channels
    const redC = img.pixels[i];
    const greenC = img.pixels[i + 1];
    const blueC = img.pixels[i + 2];

    // Convert and constrain channels for new image
    imgOut.pixels[i] = 255 - redC;
    imgOut.pixels[i + 1] = 255 - greenC;
    imgOut.pixels[i + 2] = 255 - blueC;
    imgOut.pixels[i + 3] = 255;
  }

  // Update
  imgOut.updatePixels();
  $timer('invertFilter', false);
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
  $timer('borderFilter', true);
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
  $timer('borderFilter', false);
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

/**
 * Logs the time taken for each filter to the console, for dev/optimisiation
 *
 * @param {string} ref - A reference to this timer
 * @param {boolean} start - Whether to start (true) or stop the timer
 *
 * @return void.
 */
function $timer (ref, start) {
  if (!devMode) {
    return;
  }
  if (start) {
    console.time(ref);
    return;
  }
  console.timeEnd(ref);
}

function getfiltersDataValue (_filter, key) {
  let value = null;
  const filters = filtersData.map(f => {
    if (f.ref === _filter && typeof f[key] !== 'undefined') {
      value = f[key];
    }
    return f;
  });
  return value;
}

function setfiltersDataValue (_filter, key, value) {
  const filters = filtersData.map(f => {
    if (f.ref === _filter && typeof f[key] !== 'undefined') {
      f[key] = value;
    }
    return f;
  });
}

function drawMenu () {
  const menuWidth = imgIn.width * 2;
  if (!menuDivRendered) {
    menuDiv = createDiv();
    menuDiv.addClass('menu');
    menuDiv.position(0, height);
    menuDiv.style('width', `${menuWidth}px`)

    const filterColumn = createDiv();
    filterColumn.addClass('menu__filter-column');
    filterColumn.parent(menuDiv);

    const filtersName = createDiv('Filters');
    filtersName.addClass('menu__title');
    filtersName.parent(filterColumn);

    filtersInner = createDiv();
    filtersInner.addClass('menu__filter-inner');
    filtersInner.parent(filterColumn);

    const colorAdjustColumn = createDiv();
    colorAdjustColumn.addClass('menu__color-adjust-column');
    colorAdjustColumn.parent(menuDiv);

    const colorAdjustName = createDiv('Colour adjust');
    colorAdjustName.addClass('menu__title');
    colorAdjustName.parent(colorAdjustColumn);

    colorAdjustInner = createDiv();
    colorAdjustInner.addClass('menu__color-adjust-inner');
    colorAdjustInner.parent(colorAdjustColumn);

    const colorAdjustButtons = createDiv();
    colorAdjustButtons.addClass('menu__color-adjust-buttons');
    colorAdjustButtons.parent(colorAdjustColumn);

    const applyButton = createButton('apply');
    applyButton.parent(colorAdjustButtons);

    const resetButton = createButton('reset');
    resetButton.parent(colorAdjustButtons);

    menuDivRendered = true;
  }
}


function drawCheckbox (id, label) {
  if (getfiltersDataValue(id, 'rendered') === true) {
    return;
  }

  const checkbox = createCheckbox(label, getfiltersDataValue(id, 'active'));
  checkbox.addClass('menu__filter-checkbox');
  checkbox.id(id);
  checkbox.parent(filtersInner);
  checkbox.changed(() => toggleFilter(id));
  setfiltersDataValue(id, 'rendered', true);
  setfiltersDataValue(id, 'checkbox', checkbox);
}

function drawSlider (slider) {
  if (slider.rendered) {
    return;

  }
  const min = 0;
  const max = 255;
  const value = 0;
  const step = 1;

  const sliderDiv = createDiv();
  sliderDiv.addClass('menu__color-adjust-slider');
  sliderDiv.parent(colorAdjustInner);
  const sliderName = createDiv(slider.label);
  sliderName.parent(sliderDiv);
  slider.slider = createSlider(min, max, value, step);
  slider.slider.parent(sliderDiv);
  slider.rendered = true;
}


function keyPressed () {
  let state;
  switch (key) {
    case '1':
      toggleFilter('sepia');
      break;
    case '2':
      toggleFilter('corners');
      break;
    case '3':
      toggleFilter('radial');
      break;
    case '4':
      toggleFilter('border');
      break;
    case '5':
      toggleFilter('sharpen');
      break;
    case '6':
      toggleFilter('grayscale');
      break;
    case '7':
      toggleFilter('invert');
      break;
    case '8':
      toggleFilter('emboss');
      break;
    default:
    // Do nothing
  }
}

function toggleFilter (_filter) {
  let state = getfiltersDataValue(_filter, 'active');
  setfiltersDataValue(_filter, 'active', !state);
  const check = getfiltersDataValue(_filter, 'checkbox');
  check.checked(!state);
  const instructions = getfiltersDataValue(_filter, 'instructions');


  loop();
}
