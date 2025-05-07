/* exported p4_inspirations, p4_initialize, p4_render, p4_mutate */


function getInspirations() {
  return [
    {
      name: "Lunch atop a Skyscraper", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/lunch-on-a-skyscraper.jpg?v=1714798266994",
      credit: "Lunch atop a Skyscraper, Charles Clyde Ebbets, 1932"
    },
    {
      name: "Train Wreck", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/train-wreck.jpg?v=1714798264965",
      credit: "Train Wreck At Monteparnasse, Levy & fils, 1895"
    },
    {
      name: "Migrant mother", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/migrant-mother.jpg?v=1714778906791",
      credit: "Migrant Mother near Nipomo, California, Dorothea Lange, 1936"
    },
    {
      name: "Disaster Girl", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/girl-with-fire.jpg?v=1714778905663",
      credit: "Four-year-old Zoë Roth, 2005"
    },
    {
      name: "Obama", 
      assetUrl: "https://cdn.glitch.global/8c0aab1b-1403-4b08-ad10-259400d84678/Barack-Obama-Stencil-1.jpg?v=1746565682475",
      credit: "https://superstencil.com/images/People-Celebrity/Barack-Obama/Barack-Obama-Stencil-1.jpg"
    },
    {
      name: "Abstract B&W", 
      assetUrl: "https://cdn.glitch.global/8c0aab1b-1403-4b08-ad10-259400d84678/black-and-white-pattern-abstract-texture-abstract-background-design-illustration-vector.jpg?v=1746565685749",
      credit: "https://static.vecteezy.com/system/resources/previews/012/012/756/original/black-and-white-pattern-abstract-texture-abstract-background-design-illustration-vector.jpg"
    },
    {
      name: "B&W Face", 
      assetUrl: "https://cdn.glitch.global/8c0aab1b-1403-4b08-ad10-259400d84678/b2ef1cc0673261e2380235cffc420c79.jpg?v=1746565689155",
      credit: "https://i.pinimg.com/originals/b2/ef/1c/b2ef1cc0673261e2380235cffc420c79.jpg"
    },
    {
      name: "B&W Skull", 
      assetUrl: "https://cdn.glitch.global/8c0aab1b-1403-4b08-ad10-259400d84678/skulls-black-white-vector-illustration_801978-69358.jpg?v=1746570370480",
      credit: "https://img.freepik.com/premium-vector/skulls-black-white-vector-illustration_801978-69358.jpg?w=1380"
    },
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width / 4, inspiration.image.height / 4);

  let design = {
    bg: 128,
    fg: []
  };

  const shapes = ["circle", "square", "triangle", "text"];
  for (let i = 0; i < 3000; i++) {
    const shapeType = random(shapes);
    const shape = {
      type: shapeType,
      x: random(width),
      y: random(height),
      w: random(width / 4),
      h: random(height / 4),
      fill: random(255),
      rotation: random(0, TWO_PI), // Add rotation property
    };

    if (shapeType === "text") {
      shape.text = String.fromCharCode(random(65, 91)); // Random letter A-Z
    }

    design.fg.push(shape);
  }
  return design;
}

function renderDesign(design, inspiration, selectedShape) {
  background(design.bg);
  noStroke();
  for (let shape of design.fg) {
    if (shape.type !== selectedShape) continue; // Only render selected shape
    fill(shape.fill, 128); // Set the fill color for the shape
    push(); // Save the current transformation state
    translate(shape.x, shape.y); // Move to the shape's position
    rotate(shape.rotation); // Apply rotation
    switch (shape.type) {
      case "circle":
        ellipse(0, 0, shape.w, shape.h);
        break;
      case "square":
        rect(-shape.w / 2, -shape.h / 2, shape.w, shape.h);
        break;
      case "triangle":
        triangle(
          0, -shape.h / 2,
          shape.w / 2, shape.h / 2,
          -shape.w / 2, shape.h / 2
        );
        break;
      case "text":
        textSize(max(shape.w, 12));
        fill(shape.fill, 128); // Add alpha value for varying opacity
        text(shape.text, 0, 0);
        break;
    }
    pop(); // Restore the previous transformation state
  }
}

let mutationCounter = 0; // Global counter to track mutations

function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  for (let shape of design.fg) {
    shape.fill = mut(shape.fill, shape.fill - 10, shape.fill + 10, rate); // Mutate based on last fill color
    shape.x = mut(shape.x, 0, width, rate);
    shape.y = mut(shape.y, 0, height, rate);
    shape.w = mut(shape.w, 5, width / 2, rate);
    shape.h = mut(shape.h, 5, height / 2, rate);
    shape.rotation = mut(shape.rotation, 0, TWO_PI, rate); // Mutate rotation

    if (shape.type === "text") {
      // Lower the mutation rate but increase the jump range
      if (random() < rate / 10) { // Lower probability of mutation
        const jumpRange = 10; // Drastic jump range
        const newCharCode = shape.text.charCodeAt(0) + floor(random(-jumpRange, jumpRange + 1));
        shape.text = String.fromCharCode(constrain(newCharCode, 65, 90)); // Ensure it's within A-Z
      }
    }
  }

  // Increment the mutation counter
  mutationCounter++;
  console.log(`Mutation Counter: ${mutationCounter}`); // Debugging log

  // Add a new shape every 10 mutations
  if (mutationCounter >= 5) {
    const shapes = ["circle", "square", "triangle", "text"];
    const shapeType = random(shapes);
    const newShape = {
      type: shapeType,
      x: random(width),
      y: random(height),
      w: random(width / 2),
      h: random(height / 2),
      fill: random(255),
    };

    if (shapeType === "text") {
      newShape.text = String.fromCharCode(random(65, 91)); // Random letter A-Z
    }

    design.fg.push(newShape);
    console.log("New shape added:", newShape); // Debugging log
    mutationCounter = 0; // Reset the counter
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}
