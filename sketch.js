// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg

let imgIn; // Image to be used
let devMode = false; // If we're in dev mode, log analysis to the screen
let menuDiv; // HTML element for the menu
let filtersInner; // HTML element for the inner menu containing the filters
let colorAdjustInner; // HTML element for the inner menu containing the colour adjusters
let menuDivRendered = false; // Ensure we only draw the menu once
const body = document.body; // Shortcut for the body tag
let loadingDiv; // HTML element for the loading message
let loadingImg; // Store the loading image on preload
const loadingTimer = 500; // How long to show the loader (milliseconds)
// Filters configuration
const filtersData = [
  {
    index: 1, // Index
    ref: 'sepia', // Name of filter
    label: `Sepia (press '1')`, // Filter label to display on screen
    _function: sepiaFilter, // Fiter function to call when activated/deactivated
    active: true, // Current active status
    rendered: false, // Whether this filter has been rendered in the menu
    checkbox: null // A handle for the checkbox used to toggle the filter
    // matrix: [] // Matrix used (OPTIONAL)
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
    ref: 'greyscale',
    label: `Greyscale (press '6')`,
    _function: greyscaleFilter,
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
  },
  {
    index: 9,
    ref: 'color',
    _function: colorFilter,
    active: true,
    rendered: true,
  }
];
// Colour adjusters configuration
const colorSliders = [
  {
    index: 0, // Index
    label: 'Red', // Label to display on screen
    rendered: false, // Whether this adjuster has been rendered
    ref: 'red', // The identifier for this filter
    slider: null, // Handle for the slider
    min: -4, // Minumum value for the slider
    max: 4, // Maximum value for the slider
    default: 0 // Default value for the slider
  },
  {
    index: 1,
    label: 'Green',
    rendered: false,
    ref: 'green',
    slider: null,
    min: -4,
    max: 4,
    default: 0
  },
  {
    index: 2,
    label: 'Blue',
    rendered: false,
    ref: 'blue',
    slider: null,
    min: -4,
    max: 4,
    default: 0
  },
  {
    index: 3,
    label: 'Brightness',
    rendered: false,
    ref: 'brightness',
    slider: null,
    min: -1,
    max: 1,
    default: 1
  }
]

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

  // Set up the loading animation
  const loader = createImg('./assets/loader.gif', 'generating image');
  loadingDiv = createDiv();
  loadingDiv.addClass('loading');
  loader.parent(loadingDiv);
}

/**
 * P5 draw functionality
 *
 * @return void.
 */
function draw () {
    background(0);

    // Draw the menu
    drawMenu();

    // Draw the colour sliders
    colorSliders.forEach(slider => {
      drawSlider(slider);
    });

    // Render initial colour image (left hand side)
    image(imgIn, 0, 0);

    // Render the filtered image (right hand side)
    image(earlyBirdFilter(imgIn), imgIn.width, 0);

    // Draw the various filters
    filtersData.forEach(_filter => {
      drawCheckbox(_filter.ref, _filter.label);
    });

    // Looping not necessary
    noLoop();
}

/**
 * P5 event listener - mouse pressed
 * Kick off a loop
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

  // Add each active filter
  let filtered = imgIn;
  filtersData.forEach((f, i) => {
    if (f.active) {
      filtered = f._function(filtered);
    }
  });

  // Show loading message
  setTimeout(() => {
    loadingDiv.removeClass('active');
  }, loadingTimer);

  // Return final image
  return filtered;
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

/**
 * Applys an unknown filter to an image, using a matrix
 *
 * @param {image} img - The image to apply the filter to
 * @param {array[]} matrix - The matrix to use
 *
 * @return {image} - The image with the added filter
 */
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

/**
 * Applys a sharpen filter to an image
 *
 * @param {image} img - The image to apply the filter to
 *
 * @return {image} - The image with the added filter
 */
function sharpenFilter (img) {
  $timer('sharpenFilter', true);
  const imgOut = applyFilterFromMatrix(img, getfiltersDataValue('sharpen', 'matrix'))
  $timer('sharpenFilter', false);
  return imgOut;
}

/**
 * Applys an emboss effect to an image
 *
 * @param {image} img - The image to apply the filter to
 *
 * @return {image} - The image with the added filter
 */
function embossFilter (img) {
  $timer('embossFilter', true);
  const imgOut = applyFilterFromMatrix(img, getfiltersDataValue('emboss', 'matrix'))
  $timer('embossFilter', false);
  return imgOut;
}

/**
 * Adds a greyscale effect to an image
 *
 * @param {image} img - The image to apply the filter to
 *
 * @return {image} - The image with the greyscale effect
 */
function greyscaleFilter (img) {

  $timer('greyscaleFilter', true);
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
  $timer('greyscaleFilter', false);
  return imgOut;
}

/**
 * Adds an invert effect to an image
 *
 * @param {image} img - The image to apply the filter to
 *
 * @return {image} - The image with the inverse effect
 */
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
 * Adds a colour filter to an image
 *
 * @param {image} img - The image to apply the border to
 *
 * @return {image} - The image with the colour filter
 */
function colorFilter (img) {
  $timer('colorFilter', true);
  const imgOut = createImage(img.width, img.height);

  // Load in the pixels
  img.loadPixels();
  imgOut.loadPixels();

  for (let i = 0, j = imgOut.imageData.data.length; i < j; i += 4) {
    // Get channels
    const redC = img.pixels[i];
    const greenC = img.pixels[i + 1];
    const blueC = img.pixels[i + 2];
    const alphaC = img.pixels[i + 3];

    imgOut.pixels[i] = redC + redC * colorSliders[0].slider.value();
    imgOut.pixels[i + 1] = greenC + greenC * colorSliders[1].slider.value();
    imgOut.pixels[i + 2] = blueC + blueC * colorSliders[2].slider.value();
    imgOut.pixels[i + 3] = alphaC + alphaC * colorSliders[3].slider.value();;
  }

  // Update
  imgOut.updatePixels();
  $timer('colorFilter', false);
  return imgOut;
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

/**
 * Gets the value of a passed key in a filters configuration
 *
 * @param {string} _filter - The filter object to search
 * @param {string} key - The key of the value to return
 *
 * @return {any} - The value at the passed key
 */
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

/**
 * Sets the value of a passed key in a filters configuration
 *
 * @param {string} _filter - The filter object to update
 * @param {string} key - The key of the value to update
 * @param {string} value - The value to update the key with
 *
 * @return void.
 */
function setfiltersDataValue (_filter, key, value) {
  const filters = filtersData.map(f => {
    if (f.ref === _filter && typeof f[key] !== 'undefined') {
      f[key] = value;
    }
    return f;
  });
}

/**
 * Draw the user menu to the screen
 *
 * @return void.
 */
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

    const resetButton = createButton('reset colours');
    resetButton.parent(colorAdjustButtons);
    resetButton.mousePressed(resetSilders);

    menuDivRendered = true;
  }
}

/**
 * Draw a filter checkbox to the screen
 *
 * @param {string} id - The id to give the checkbox
 * @param {string} label - The label to display on the screen
 *
 * @return void.
 */
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

/**
 * Draw a colour adjustment slider to the screen
 *
 * @param {object} slider - The config object to use for the slider
 *
 * @return void.
 */
function drawSlider (slider) {
  if (slider.rendered) {
    return;

  }

  const sliderDiv = createDiv();
  sliderDiv.addClass('menu__color-adjust-slider');
  sliderDiv.parent(colorAdjustInner);
  const sliderName = createDiv(slider.label);
  sliderName.parent(sliderDiv);
  slider.slider = createSlider(slider.min, slider.max, slider.default, 0.1);
  slider.slider.parent(sliderDiv);
  slider.slider.changed(sliderChanged);
  slider.rendered = true;
}

/**
 * Slider event - when slider changes, call loop()
 *
 * @return void.
 */
function sliderChanged () {
  loop();
}

/**
 * Rest all adjustment sliders to their default values
 *
 * @return void.
 */
function resetSilders () {
  colorSliders[0].slider.value(colorSliders[0].default)
  colorSliders[1].slider.value(colorSliders[1].default)
  colorSliders[2].slider.value(colorSliders[2].default)
  colorSliders[3].slider.value(colorSliders[3].default)
  loop();
}

/**
 * p5 event - when a key is pressed
 * Passes relevant filter reference on to toggle function
 *
 * @return void.
 */
function keyPressed () {
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
      toggleFilter('greyscale');
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

/**
 * Toggles a filter between active and inactive
 *
 * @return void.
 */
function toggleFilter (_filter) {
  let state = getfiltersDataValue(_filter, 'active');
  setfiltersDataValue(_filter, 'active', !state);
  const check = getfiltersDataValue(_filter, 'checkbox');
  check.checked(!state);
  loop();
}
