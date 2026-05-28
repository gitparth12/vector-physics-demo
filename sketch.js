let balls = [];
let boxObj;

let textures = [];
let lightEnabled = true;

let planetNames = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto"
];

// Sliders for playing around with values
let gravitySlider;
let restitutionSlider;
let dragSlider;
let lightSlider;
let spawnSlider;
let frictionSlider;
let uiHovered = false;
let hintText;

function preload() {
  for (let name of planetNames) {
    textures.push(
      loadImage("data/" + name + ".jpg")
    );
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  boxObj = new Box();

  // UI for sliders
  createUI();

  for (let i = 0; i < 5; i++) {
    spawnBall(
      random(-100, 100),
      random(-100, 100),
      random(-100, 100)
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  // Dark cinematic background
  background(5, 8, 15);

  if (!uiHovered && keyIsDown(SHIFT)) {
    orbitControl();
  }

  // ===== LIGHTING =====

  let lightStrength = lightSlider.value();

  // Base ambient
  ambientLight(
    lightStrength * 0.12,
    lightStrength * 0.12,
    lightStrength * 0.16
  );

  // Main front light
  pointLight(
    lightStrength,
    lightStrength,
    lightStrength,
    0,
    -300,
    400
  );

  // Blue rim light
  pointLight(
    lightStrength * 0.4,
    lightStrength * 0.5,
    lightStrength,
    -500,
    100,
    -200
  );

  // Warm secondary light
  pointLight(
    lightStrength,
    lightStrength * 0.7,
    lightStrength * 0.4,
    500,
    -100,
    200
  );

  // Better material response
  specularMaterial(255);

  shininess(80);

  // ===== PHYSICS =====

  let dt = deltaTime / 16.666;

  for (let ball of balls) {
    ball.move(dt);
  }

  handleCollisions();

  // ===== DRAW =====

  for (let ball of balls) {
    ball.display();
  }

  boxObj.display();
}

function mousePressed() {
  if (uiHovered || keyIsDown(SHIFT)) return;

  spawnBall(
    mouseX - width / 2,
    mouseY - height / 2,
    random(-100, 100)
  );
}

function keyPressed() {
  if (key === 'd') {
    balls = [];
  }

  if (key === 'g') {
    Ball.gravityEnabled =
      !Ball.gravityEnabled;
  }
}

function spawnBall(x, y, z) {
  let radius = spawnSlider.value();

  let speed = createVector(
    random(-6, 6),
    random(-6, 6),
    random(-6, 6)
  );

  let tex = random(textures);

  let ball = new Ball(
    createVector(x, y, z),
    speed,
    radius,
    tex
  );

  balls.push(ball);
}

class Box {
  constructor() {
    this.size = 400;
  }

  display() {

    push();

    stroke(120, 160);

    strokeWeight(1);

    noFill();

    box(this.size);

    pop();
  }
}

class Ball {

  static gravityEnabled = false;

  constructor(pos, vel, radius, tex) {

    this.pos = pos;
    this.vel = vel;

    this.radius = radius;

    // Realistic mass
    this.mass = radius * radius * radius * 0.001;

    this.tex = tex;

    this.boxSize = 400;

    // Angular velocity
    this.angularVel = createVector(
      random(-0.02, 0.02),
      random(-0.02, 0.02),
      random(-0.02, 0.02)
    );

    this.rotation = createVector();
  }

  move(dt) {

    // Optional gravity
    if (Ball.gravityEnabled) {
      this.vel.y += gravitySlider.value() * dt;
    }

    // Smooth drag
    this.vel.mult(1 - dragSlider.value());

    this.pos.add(
      p5.Vector.mult(this.vel, dt)
    );

    this.rotation.add(this.angularVel);

    this.angularVel.mult(0.995);

    this.wallCollisions();
  }

  wallCollisions() {

    let half = this.boxSize / 2;

    // Restitution
    let bounce = 0.95;

    // X
    if (this.pos.x > half - this.radius) {
      this.pos.x = half - this.radius;
      this.vel.x *= -bounce;
    }

    if (this.pos.x < -half + this.radius) {
      this.pos.x = -half + this.radius;
      this.vel.x *= -bounce;
    }

    // Y
    if (this.pos.y > half - this.radius) {
      this.pos.y = half - this.radius;
      this.vel.y *= -bounce;
    }

    if (this.pos.y < -half + this.radius) {
      this.pos.y = -half + this.radius;
      this.vel.y *= -bounce;
    }

    // Z
    if (this.pos.z > half - this.radius) {
      this.pos.z = half - this.radius;
      this.vel.z *= -bounce;
    }

    if (this.pos.z < -half + this.radius) {
      this.pos.z = -half + this.radius;
      this.vel.z *= -bounce;
    }
  }

  display() {

    push();

    translate(
      this.pos.x,
      this.pos.y,
      this.pos.z
    );

    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotateZ(this.rotation.z);

    noStroke();

    shininess(80);

    texture(this.tex);

    sphere(this.radius);

    pop();
  }
}

function handleCollisions() {

  for (let i = 0; i < balls.length; i++) {

    for (let j = i + 1; j < balls.length; j++) {

      let a = balls[i];
      let b = balls[j];

      let normal =
        p5.Vector.sub(b.pos, a.pos);

      let distance = normal.mag();

      let minDistance =
        a.radius + b.radius;

      if (distance < minDistance) {

        normal.normalize();

        // Positional correction
        let overlap =
          minDistance - distance;

        let correction =
          p5.Vector.mult(
            normal,
            overlap / 2
          );

        a.pos.sub(correction);
        b.pos.add(correction);

        // Relative velocity
        let relativeVelocity =
          p5.Vector.sub(
            b.vel,
            a.vel
          );

        let speed =
          relativeVelocity.dot(normal);

        // Ignore separating collisions
        if (speed > 0) continue;

        // Restitution
        let restitution = restitutionSlider.value();

        let impulse =
          -(1 + restitution) * speed;

        impulse /=
          (1 / a.mass) +
          (1 / b.mass);

        let impulseVector =
          p5.Vector.mult(
            normal,
            impulse
          );

        a.vel.sub(
          p5.Vector.mult(
            impulseVector,
            1 / a.mass
          )
        );

        b.vel.add(
          p5.Vector.mult(
            impulseVector,
            1 / b.mass
          )
        );

        // Add spin from tangential movement
        let tangent =
          createVector(
            -normal.y,
            normal.x,
            normal.z
          );

        tangent.normalize();

        let spinForce =
          relativeVelocity.dot(tangent);

        a.angularVel.add(
          p5.Vector.mult(
            tangent,
            spinForce * 0.002
          )
        );

        b.angularVel.sub(
          p5.Vector.mult(
            tangent,
            spinForce * 0.002
          )
        );

        // Visual rolling spin from friction
        let friction = frictionSlider.value();

        // Relative tangential motion
        let tangentVelocity =
          relativeVelocity.copy();

        tangentVelocity.sub(
          p5.Vector.mult(
            normal,
            relativeVelocity.dot(normal)
          )
        );

        // Convert sliding into angular velocity
        let spin =
          tangentVelocity.copy().mult(
            friction * 0.05
          );

        a.angularVel.add(spin);

        b.angularVel.sub(spin);
      }
    }
  }
}

// Create UI for sliders -> this is not the best looking code but it works for demonstration purposes
function createUI() {

  let panel = createDiv();

  panel.mouseOver(() => {
    uiHovered = true;
  });

  panel.mouseOut(() => {
    uiHovered = false;
  });

  panel.style("position", "absolute");
  panel.style("left", "15px");
  panel.style("top", "15px");

  panel.style("padding", "15px");

  panel.style("background", "rgba(0,0,0,0.5)");

  panel.style("color", "white");

  panel.style("font-family", "sans-serif");

  panel.style("border-radius", "10px");

  panel.style("backdrop-filter", "blur(8px)");

  panel.style("width", "220px");

  createP("Gravity").parent(panel);

  gravitySlider =
    createSlider(0, 1, 0, 0.01);

  gravitySlider.parent(panel);

  createP("Restitution (bounciness)").parent(panel);

  restitutionSlider =
    createSlider(0.5, 1.2, 0.92, 0.01);

  restitutionSlider.parent(panel);

  createP("Drag (air resistance)").parent(panel);

  dragSlider = createSlider(0, 0.05, 0.001, 0.0001);

  dragSlider.parent(panel);

  createP("Collision Friction").parent(panel);

  frictionSlider =
    createSlider(0, 1, 0.15, 0.01);

  frictionSlider.parent(panel);

  createP("Light Intensity").parent(panel);

  lightSlider =
    createSlider(0, 255, 255, 1);

  lightSlider.parent(panel);

  createP("Spawn Radius").parent(panel);

  spawnSlider =
    createSlider(10, 50, 25, 1);

  spawnSlider.parent(panel);

  let button = createButton("Spawn Ball");

  button.parent(panel);

  button.mousePressed(() => {

    spawnBall(
      random(-100, 100),
      random(-100, 100),
      random(-100, 100)
    );

  });

  let clearButton =
    createButton("Clear Balls");

  clearButton.parent(panel);

  clearButton.mousePressed(() => {
    balls = [];
  });

  hintText = createDiv(
  "Hold SHIFT + Drag to rotate camera"
);

  hintText.style("position", "absolute");

  hintText.style("bottom", "20px");

  hintText.style("left", "20px");

  hintText.style("color", "white");

  hintText.style("font-family", "sans-serif");

  hintText.style("font-size", "14px");

  hintText.style("background", "rgba(0,0,0,0.5)");

  hintText.style("padding", "10px");

  hintText.style("border-radius", "8px");

  hintText.style("backdrop-filter", "blur(6px)");
}