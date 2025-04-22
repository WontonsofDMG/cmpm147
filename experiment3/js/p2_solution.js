/* exported generateGrid, drawGrid */
/* global placeTile */

let isDungeonMode = false;

function toggleMode() {
  isDungeonMode = !isDungeonMode;
  const button = document.getElementById("toggleModeButton");
  button.textContent = isDungeonMode ? "Switch to Overworld" : "Switch to Dungeon";

  // Reset random seed
  randomSeed(seed);
  noiseSeed(seed);

  regenerateGrid();
}

function generateGrid(numCols, numRows) {
  return isDungeonMode ? generateDungeonGrid(numCols, numRows) : generateOverworldGrid(numCols, numRows);
}

function generateOverworldGrid(numCols, numRows) {
  let grid = [];

  // Ground
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("_");
    }
    grid.push(row);
  }

  // Lake
  let lakeWidth = floor(random(5, 10));
  let lakeHeight = floor(random(5, 8));
  let lakeX = floor(random(1, numCols - lakeWidth - 1));
  let lakeY = floor(random(1, numRows - lakeHeight - 1));
  for (let y = lakeY; y < lakeY + lakeHeight; y++) {
    for (let x = lakeX; x < lakeX + lakeWidth; x++) {
      grid[y][x] = ".";
    }
  }

  // River
  let riverCenter = floor(random(2, numCols - 2));
  for (let y = 0; y < numRows; y++) {
    let offset = floor(random(-1, 2)); // Drift left/right
    riverCenter = constrain(riverCenter + offset, 1, numCols - 2);
    grid[y][riverCenter - 1] = "~";
    grid[y][riverCenter] = "~";
    grid[y][riverCenter + 1] = "~";
  }

  // Forest
  for (let i = 0; i < 8; i++) {
    let fw = floor(random(3, 6));
    let fh = floor(random(3, 6));
    let fx = floor(random(1, numCols - fw - 1));
    let fy = floor(random(1, numRows - fh - 1));

    for (let y = fy; y < fy + fh; y++) {
      for (let x = fx; x < fx + fw; x++) {
        if (grid[y][x] === "_") {
          grid[y][x] = "T";
        }
      }
    }
  }

  // Single trees
  for (let i = 0; i < 30; i++) {
    let tx = floor(random(numCols));
    let ty = floor(random(numRows));
    if (grid[ty][tx] === "_") {
      grid[ty][tx] = "t";
    }
  }

  // Houses
  for (let i = 0; i < 5; i++) {
    let hx = floor(random(numCols));
    let hy = floor(random(numRows));
    if (grid[hy][hx] === "_") {
      grid[hy][hx] = "H";
    }
  }

  return grid;
}

function generateDungeonGrid(numCols, numRows) {
  let grid = [];

  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("W");
    }
    grid.push(row);
  }

  let rooms = [];
  let maxRooms = 8;
  let maxTries = 100;

  for (let t = 0; t < maxTries && rooms.length < maxRooms; t++) {
    let rw = floor(random(6, 10));
    let rh = floor(random(6, 10));
    let rx = floor(random(1, numCols - rw - 1));
    let ry = floor(random(1, numRows - rh - 1));
    let newRoom = { x: rx, y: ry, w: rw, h: rh };

    if (!rooms.some(r => roomsOverlap(r, newRoom))) {
      rooms.push(newRoom);
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          grid[y][x] = ".";
        }
      }
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    let a = centerOf(rooms[i - 1]);
    let b = centerOf(rooms[i]);

    if (random() < 0.5) {
      carveHallway(grid, a.x, a.y, b.x, a.y, "h");
      carveHallway(grid, b.x, a.y, b.x, b.y, "h");
    } else {
      carveHallway(grid, a.x, a.y, a.x, b.y, "h");
      carveHallway(grid, a.x, b.y, b.x, b.y, "h");
    }
  }

  for (let x = 0; x < numCols; x++) {
    if (grid[0][x] === "h") grid[0][x] = "D";
    if (grid[numRows - 1][x] === "h") grid[numRows - 1][x] = "D";
  }
  for (let y = 0; y < numRows; y++) {
    if (grid[y][0] === "h") grid[y][0] = "D";
    if (grid[y][numCols - 1] === "h") grid[y][numCols - 1] = "D";
  }

  for (let i = 0; i < min(5, rooms.length); i++) {
    let room = rooms[i];
    let cx = floor(random(room.x + 1, room.x + room.w - 2));
    let cy = floor(random(room.y + 1, room.y + room.h - 2));
    grid[cy][cx] = "C";
  }

  return grid;
}

function roomsOverlap(a, b) {
  return (
    a.x <= b.x + b.w + 1 &&
    a.x + a.w + 1 >= b.x &&
    a.y <= b.y + b.h + 1 &&
    a.y + a.h + 1 >= b.y
  );
}

function centerOf(room) {
  return {
    x: floor(room.x + room.w / 2),
    y: floor(room.y + room.h / 2)
  };
}

function carveHallway(grid, x1, y1, x2, y2, code = "h") {
  let dx = x2 > x1 ? 1 : -1;
  let dy = y2 > y1 ? 1 : -1;

  // Horizontal
  for (let x = x1; x !== x2 + dx; x += dx) {
    for (let h = 0; h < 2; h++) {
      let y = y1 + h;
      if (grid[y] && grid[y][x] !== undefined) {
        grid[y][x] = code;
      }
    }
  }

  // Vertical
  for (let y = y1; y !== y2 + dy; y += dy) {
    for (let h = 0; h < 2; h++) {
      let x = x2 + h;
      if (grid[y] && grid[y][x] !== undefined) {
        grid[y][x] = code;
      }
    }
  }
}

function drawGrid(grid) {
  background(isDungeonMode ? 40 : 128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      let code = grid[i][j];

      if (isDungeonMode) {
        // Dungeon drawing logic
        if (code === "W") {
          placeTile(i, j, floor(random(21, 24)), floor(random(21, 24))); // solid wall
          continue;
        }

        if (code === "D") {
          placeTile(i, j, floor(random(25, 27)), floor(random(26, 28))); // door tile
          continue;
        }

        if (code === "." || code === "C" || code === "h") {
          placeTile(i, j, floor(random(3)), 15); // room base floor
          if (grid[i][j - 1] === "W") placeTile(i, j, 25, 22); // left
          if (grid[i][j + 1] === "W") placeTile(i, j, 27, 22); // right
          if (grid[i - 1]?.[j] === "W") placeTile(i, j, 26, 21); // top
          if (grid[i + 1]?.[j] === "W") placeTile(i, j, 26, 23); // bottom
          if (grid[i][j - 1] === "W" && grid[i - 1]?.[j] === "W")
            placeTile(i, j, 25, 21); // top left
          if (grid[i][j + 1] === "W" && grid[i - 1]?.[j] === "W")
            placeTile(i, j, 27, 21); // top right
          if (grid[i][j + 1] === "W" && grid[i + 1]?.[j] === "W")
            placeTile(i, j, 27, 23); // bottom right
          if (grid[i][j - 1] === "W" && grid[i + 1]?.[j] === "W")
            placeTile(i, j, 25, 23); // bottom left
          if (code === "C") placeTile(i, j, floor(random(6)), floor(random(28, 30))); // chest overlay
          continue;
        }
      } else {
        // Overworld drawing logic
        if (code === "_") {
          placeTile(i, j, floor(random(4)), 0);
          continue;
        }

        if (code === "." || code === "~") {
          placeTile(i, j, floor(random(4)), 14);
          if (grid[i][j - 1] !== "." && grid[i][j - 1] !== "~")
            placeTile(i, j, 9, 1);
          if (grid[i][j + 1] !== "." && grid[i][j + 1] !== "~")
            placeTile(i, j, 11, 1);
          if (grid[i - 1]?.[j] !== "." && grid[i - 1]?.[j] !== "~")
            placeTile(i, j, 10, 0);
          if (grid[i + 1]?.[j] !== "." && grid[i + 1]?.[j] !== "~")
            placeTile(i, j, 10, 2);
          continue;
        }

        if (code === "T") {
          placeTile(i, j, floor(random(4)), 0);
          if (grid[i][j - 1] !== "T") placeTile(i, j, 15, 1);
          else if (grid[i][j + 1] !== "T") placeTile(i, j, 17, 1);
          else if (grid[i - 1]?.[j] !== "T") placeTile(i, j, 15, 0);
          else if (grid[i + 1]?.[j] !== "T") placeTile(i, j, 16, 2);

          else if (grid[i][j - 1] !== "T" && grid[i - 1]?.[j] !== "T")
            placeTile(i, j, 15, 0);
          else if (grid[i][j + 1] !== "T" && grid[i - 1]?.[j] !== "T")
            placeTile(i, j, 17, 0);
          else if (grid[i][j + 1] !== "T" && grid[i + 1]?.[j] !== "T")
            placeTile(i, j, 17, 2);
          else if (grid[i][j - 1] !== "T" && grid[i + 1]?.[j] !== "T")
            placeTile(i, j, 15, 2);
          else placeTile(i, j, 16, 1); // center
          continue;
        }

        if (code === "t") {
          placeTile(i, j, floor(random(4)), 0);
          placeTile(i, j, 14, 0);
          continue;
        }

        if (code === "H") {
          placeTile(i, j, floor(random(4)), 0);
          placeTile(i, j, 26, floor(random(4)));
          continue;
        }
      }
    }
  }
}

document.getElementById("toggleModeButton").addEventListener("click", toggleMode);
