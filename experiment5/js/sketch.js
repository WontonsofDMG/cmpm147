/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;

function preload() {
  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  const selectedShape = document.getElementById("shape-selector").value; // Get the selected shape
  currentDesign = initDesign(currentInspiration, selectedShape); 
  bestDesign = currentDesign;
  image(currentInspiration.image, 0, 0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;

  // Add the inspiration image to the "Initial Memory" container
  const initialMemoryContainer = document.getElementById("initial-memory");
  initialMemoryContainer.innerHTML = ""; // Clear any existing content
  const img = document.createElement("img");
  img.src = currentInspiration.image.canvas.toDataURL(); // Convert p5 image to data URL
  img.width = width; // Adjust size as needed
  img.height = height; // Adjust size as needed
  initialMemoryContainer.appendChild(img);
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}

function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 1.5;
  img.height = height / 1.5;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  if (!currentDesign) {
    return;
  }

  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  rate.innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value / 100.0);

  const selectedShape = document.getElementById("shape-selector").value; // Get selected shape
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration, selectedShape); // Pass selected shape
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;

  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }

  fpsCounter.innerHTML = Math.round(frameRate());
}