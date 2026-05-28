# Vector Physics Sandbox

An interactive 3D vector physics sandbox built with p5.js for experimenting with:

- vectors
- collisions
- momentum
- drag
- restitution
- angular motion
- lighting in WEBGL

This project was created as a teaching/demo tool for my p5.js class and is designed to help students explore how vector mathematics is used in real-time simulations and game physics. It was inspired by one of my university assignments from a couple of years ago, which was originally implemented in [Processing](https://processing.org/) (Java mode).

---

## Features

- 3D WEBGL rendering
- Elastic sphere collisions
- Collision-based angular spin
- Adjustable gravity, drag, restitution, and lighting
- Interactive camera controls
- Real-time parameter sliders
- Planet textures
- Motion damping
- Dynamic lighting system

---

## Controls

| Action          | Control             |
| --------------- | ------------------- |
| Spawn ball      | Left click          |
| Rotate camera   | Hold `SHIFT` + drag |
| Clear all balls | `d`                 |
| Toggle gravity  | `g`                 |

---

## Physics Concepts Demonstrated

This sandbox demonstrates several important vector and physics concepts:

### Vector Operations

- vector addition
- vector subtraction
- normalization
- dot products
- tangential motion
- projections

### Collision Physics

- collision normals
- impulse response
- restitution
- positional correction
- relative velocity

### Motion

- drag/damping
- gravity
- angular velocity
- rotational damping

---

## Technologies Used

- p5.js
- WEBGL
- JavaScript

---

## Running Locally

Because textures are loaded dynamically, it is recommended to run this project using a local server.

Example using Python:

```bash
python -m http.server
```

Then open:

```txt
http://localhost:8000
```

---

## Live Demo

GitHub Pages:

- (add your deployed link here)

---

## Future Ideas

Possible extensions for students:

- particle trails
- shadows
- spatial partitioning
- true rigid body rotation
- multiple collision materials
- force visualizations
- gravity wells
- multiplayer interactions

---

## License

This project is intended for educational purposes and experimentation.
