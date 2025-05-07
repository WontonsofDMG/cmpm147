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

function initDesign(inspiration, selectedShape) {
  resizeCanvas(inspiration.image.width / 6, inspiration.image.height / 6);

  let design = {
    bg: 128,
    fg: []
  };

  // Determine the number of shapes based on the selected shape type
  const shapeCount = selectedShape === "text" ? 442 : 2500;

  for (let i = 0; i < shapeCount-1; i++) {
    const shape = {
      type: selectedShape, // Use the selected shape type
      x: random(0,width),
      y: random(0,height),
      w: random(0,width / 6),
      h: random(0,height / 6),
      fill: random(255),
      rotation: random(0, TWO_PI), // Add rotation property
    };

    if (selectedShape === "text") {
      shape.text = String.fromCharCode(random(65, 91)); // Random letter A-Z
    }

    if (["triangle", "text", "square", "circle"].includes(selectedShape)) {
      design.fg.push(shape);
    }
  }
  return design;
}

function renderDesign(design, inspiration, selectedShape) {
  console.log("currentDesign:", currentDesign);
  console.log("currentInspiration:", currentInspiration);
  console.log("selectedShape:", selectedShape);
  background(design.bg);
  noStroke();
  for (let shape of design.fg) {
    //if (shape.type !== selectedShape) continue; // Only render selected shape
    fill(shape.fill, 128); // Set the fill color for the shape
    push(); // Save the current transformation state
    translate(shape.x, shape.y); // Move to the shape's position
    rotate(shape.rotation); // Apply rotation
    switch (shape.type) {
      case "circle":
        ellipseMode(CORNER);
        ellipse(-shape.w / 2, -shape.h / 2, shape.w, shape.h);
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
        textSize(max(shape.w*1.5, 24));
        fill(shape.fill, 128); // Add alpha value for varying opacity
        //strokeWeight(6); // Set the thickness of the stroke
        text(shape.text, 0, 0);
        break;
      default:
        console.error(`Unknown shape type: ${shape.type}`); // Add error handling for unknown shapes
    }
    pop(); // Restore the previous transformation state
  }
}

function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  for (let shape of design.fg) {
    shape.fill = constrain(mut(shape.fill, shape.fill - 15, shape.fill + 15, rate*30), 0, 255);
    shape.x = mut(shape.x, 0, width, rate);
    shape.y = mut(shape.y, 0, height, rate);
    shape.w = mut(shape.w, 5, width/2, rate);
    shape.h = mut(shape.h, 5, height/2, rate);
    shape.rotation = mut(shape.rotation, 0, TWO_PI, rate); // Mutate rotation

    if (shape.type === "text") {
      // Lower the mutation rate but increase the jump range
      if (random() < rate/3 ) { // Lower probability of mutation
        const jumpRange = 10; // Drastic jump range
        const newCharCode = shape.text.charCodeAt(0) + floor(random(-jumpRange, jumpRange + 1));
        shape.text = String.fromCharCode(constrain(newCharCode, 65, 90)); // Ensure it's within A-Z
      }
    }
  }

}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}

// Add event listener to trigger the restart button when a shape is chosen
document.getElementById("shape-selector").addEventListener("change", () => {
  restart.click(); // Simulate a click on the restart button
});
