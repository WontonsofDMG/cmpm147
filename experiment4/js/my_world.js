"use strict";

/* global XXH, loadImage, image, frameCount, mouseX, mouseY, dist */
/* exported -- 
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

let worldSeed;
let tileImages = {}; // Object to store tile images
let portalSpritesheet; // Variable to store the portal spritesheet
let pico8Spritesheet; // Variable to store the pico8-isometric spritesheet
let lastWorldSpritesheet; // Variable to store the MRMO_BRIK spritesheet
const portalFrameCount = 6; // Number of frames in the portal animation
const pico8TileWidth = 32; // Width of each tile in pico8-isometric.png
const pico8TileHeight = 32; // Height of each tile in pico8-isometric.png
const lastWorldTileWidth = 130; // Width of each tile in MRMO_BRIK.png
const lastWorldTileHeight = 140; // Height of each tile in MRMO_BRIK.png
let isPico8World = false; // Flag to track if we're in the Pico-8 world
let isLastWorld = false; // Flag to track if we're in the last world

function p3_preload() {
  // Load tile images
  tileImages.castle = loadImage("./js/castle_gate_W.png");
  tileImages.dirt = loadImage("./js/dirt_center_S.png");
  tileImages.grass = loadImage("./js/grass_center_N.png");
  tileImages.tree = loadImage("./js/tree_single_N.png");
  tileImages.water = loadImage("./js/water_center_W.png");

  // Load the portal spritesheet
  portalSpritesheet = loadImage("./js/isometric_Portal.png");

  // Load the pico8-isometric spritesheet
  pico8Spritesheet = loadImage("./js/pico8-isometric.png");

  // Load the MRMO_BRIK spritesheet for the last world
  lastWorldSpritesheet = loadImage("./js/MRMO_BRIK.png");
}

function p3_setup() {}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);

  // Check if the clicked tile is a portal
  const overlayHash = XXH.h32("overlay:" + [i, j], worldSeed) % 500;
  if (overlayHash === 0) {
    if (isPico8World) {
      // Switch to the last world
      const newKey = "last_world"; // Placeholder key for the last world
      p3_worldKeyChanged(newKey);
      isPico8World = false;
      isLastWorld = true;

      // Update the input field with the new world key
      const inputField = document.querySelector("input");
      if (inputField) {
        inputField.value = newKey;
      }
    } else if (isLastWorld) {
      // Switch back to the first world
      const newKey = "first_world"; // Placeholder key for the first world
      p3_worldKeyChanged(newKey);
      isLastWorld = false;
      isPico8World = false;

      // Update the input field with the new world key
      const inputField = document.querySelector("input");
      if (inputField) {
        inputField.value = newKey;
      }
    } else {
      // Switch to the Pico-8 world
      const newKey = "pico8_world"; // Placeholder key for the Pico-8 world
      p3_worldKeyChanged(newKey);
      isPico8World = true;

      // Update the input field with the new world key
      const inputField = document.querySelector("input");
      if (inputField) {
        inputField.value = newKey;
      }
    }
  }
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();

  // Check if the current tile is a portal
  const overlayHash = XXH.h32("overlay:" + [i, j], worldSeed) % 500;
  let baseTileType;
  const noiseValue = noise(i * 0.1, j * 0.1); // Use Perlin noise for smoother formations

  if (noiseValue < 0.3) {
    baseTileType = "water"; // Water tiles for rivers/lakes
  } else if (noiseValue < 0.4) {
    baseTileType = "dirt"; // Dirt tiles for roads
  } else {
    baseTileType = "grass"; // Grass tiles
  }

  // Prevent portal placement on water tiles
  if (overlayHash === 0 && portalSpritesheet && baseTileType !== "water") {
    // Draw the animated portal
    const frameIndex = Math.floor(frameCount / 10) % portalFrameCount; // Change frame every 10 frames
    const frameWidth = portalSpritesheet.width / portalFrameCount;
    push();
    imageMode(CENTER);
    image(
      portalSpritesheet,
      0,
      -th * 1.5,
      tw * 2,
      th * 6,
      frameIndex * frameWidth,
      0,
      frameWidth,
      portalSpritesheet.height
    );
    pop();
    return;
  }

  if (isLastWorld) {
    // Draw tiles from MRMO_BRIK.png
    const lastWorldTileType = determineLastWorldTileType(i, j);
    if (lastWorldTileType) {
      const [sx, sy] = lastWorldTileType;
      push();
      imageMode(CENTER);
      image(
        lastWorldSpritesheet,
        0,
        th * 1.2,
        tw * 2,
        th * 4.5,
        sx * lastWorldTileWidth,
        sy * lastWorldTileHeight,
        lastWorldTileWidth,
        lastWorldTileHeight
      );
      pop();
    }
    return;
  }

  if (isPico8World) {
    // Draw tiles from pico8-isometric.png
    const pico8TileType = determinePico8TileType(i, j);
    if (pico8TileType) {
      const [sx, sy] = pico8TileType;
      push();
      imageMode(CENTER);
      image(
        pico8Spritesheet,
        0,
        -th *0.2,
        tw * 1.5,
        th * 4,
        sx * pico8TileWidth,
        sy * pico8TileHeight,
        pico8TileWidth,
        pico8TileHeight
      );
      pop();
    }
    return;
  }

  // Draw the base tile
  const baseImg = tileImages[baseTileType];
  if (baseImg) {
    push();
    imageMode(CENTER);
    image(baseImg, 0, 0, tw * 2.5, th * 7); // Use tw and th directly to preserve the original aspect ratio
    pop();
  }

  // Place trees and castles over the base tiles
  if (baseTileType !== "water") {
    const overlayNoise = noise(i * 0.2, j * 0.2); // Separate noise for overlay objects
    if (overlayNoise < 0.14) {
      // Place a castle (less frequent)
      const castleImg = tileImages.castle;
      if (castleImg) {
        
        push();
        imageMode(CENTER);
        image(castleImg, 0, -th * 1.5, tw * 2, th * 5);
        pop();
      }
    } else if (overlayNoise >= 0.3 && overlayNoise < 0.4) {
      // Place a tree (more frequent, like lakes), but ensure it's not too close to a castle
      const treeImg = tileImages.tree;
      if (treeImg) {
        push();
        imageMode(CENTER);
        image(treeImg, 0, -th * 2, tw * 2.5, th * 7);
        pop();
      }
    }
  }
}

function determinePico8TileType(i, j) {
  // Use Perlin noise or other logic to determine the tile type
  const noiseValue = noise(i * 0.1, j * 0.1);
  if (noiseValue < 0.3) return [0, 3]; // Water
  if (noiseValue < 0.4) return [0, 1]; // Dirt
  if (noiseValue < 0.6) return [0, 0]; // Grass
  if (noiseValue < 0.8) return [1, 0]; // Tree
  return [2, 1]; // Castle
}

function determineLastWorldTileType(i, j) {
  // Use Perlin noise or other logic to determine the tile type
  const noiseValue = noise(i * 0.1, j * 0.1);
  if (noiseValue < 0.2) return [2, 2]; // Water-like tile
  if (noiseValue < 0.4) return [1, 1]; // Dirt-like tile
  if (noiseValue < 0.6) return [0, 0]; // Grass-like tile
  if (noiseValue < 0.8) return [2, 2]; // Tree-like tile
  return [3, 3]; // Castle-like tile
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {}
