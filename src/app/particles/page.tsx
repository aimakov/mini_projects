"use client";

import React, { useEffect, useRef } from "react";

type Props = {};

class Particle {
  effect: any;
  x: number;
  y: number;
  radius: number;
  speedModifier: number;
  speedX: number;
  speedY: number;

  constructor(effect: any) {
    this.effect = effect;

    this.reset();

    this.radius = Math.random() * 3 + 2;

    this.speedModifier = Math.floor(Math.random() * 10 + 5);
  }

  reset() {
    let x = Math.random() * this.effect.width - 1;
    let y = Math.random() * this.effect.height - 1;

    while (
      Math.sqrt(
        Math.pow(this.effect.center.x - x, 2) +
          Math.pow(this.effect.center.y - y, 2)
      ) < this.effect.centerRadius
    ) {
      x = Math.random() * this.effect.width;
      y = Math.random() * this.effect.height;
    }

    this.x = x;
    this.y = y;
  }

  draw(context: any) {
    // context.fillRect(this.x, this.y, 10, 10);
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
  }

  update() {
    if (
      Math.sqrt(
        Math.pow(this.effect.center.x - this.x, 2) +
          Math.pow(this.effect.center.y - this.y, 2)
      ) < this.effect.centerRadius
    ) {
      this.reset();
    } else {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;

      if (this.effect.flowField[index] !== undefined) {
        this.speedX = this.effect.flowField[index].x;
        this.speedY = this.effect.flowField[index].y;

        this.x += this.speedX * this.speedModifier;
        this.y += this.speedY * this.speedModifier;
      } else {
        this.reset();
      }

      // console.log(this.effect.flowField[index].x, this.speedX);
    }
  }
}

class Effect {
  width: number;
  height: number;
  particles: any[];
  numberOfParticles: number;
  cellSize: number;
  rows: number;
  cols: number;
  flowField: { x: number; y: number }[];
  curve: number;
  zoom: number;
  debug: boolean;
  canvas: any;
  context: any;

  center: { x: number; y: number };
  divider: number;
  centerRadius: number;

  constructor(canvas: any, context: any) {
    this.canvas = canvas;
    this.context = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 500;
    this.cellSize = 30;
    this.rows;
    this.cols;
    this.flowField = [];
    this.curve = 0.2;
    this.zoom = 0.1;
    this.debug = false;

    this.center = { x: this.width / 2, y: this.height / 2 };
    this.divider = 200;
    this.centerRadius = 100;

    this.init();

    window.addEventListener("keydown", (e) => {
      if (e.key === "d") {
        this.debug = !this.debug;
      }
    });

    window.addEventListener("resize", (e: any) => {
      this.resize(e.target.innerWidth, e.target.innerHeight);
    });
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.context.strokeStyle = "white";

    this.init();
  }

  createSpiralFlowField(pointX: number, pointY: number) {
    // Iterate through each pixel in the canvas

    pointX = pointX - this.width / 2;
    pointY = pointY - this.height / 2;

    // Calculate the distance from the current pixel to the center
    let vx = pointY - pointX;
    let vy = -pointX - pointY;

    return { x: vx / this.divider, y: vy / this.divider };

    // Create an object representing the vector and add it to the row
  }

  init() {
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.flowField = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.flowField.push(
          this.createSpiralFlowField(
            (x + 0.5) * this.cellSize,
            (y + 0.5) * this.cellSize
          )
        );
      }
    }

    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  render(context: any) {
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }

  drawGrid(context: any) {
    for (let c = 0; c < this.cols; c++) {
      context.beginPath();
      context.moveTo(this.cellSize * c, 0);
      context.lineTo(this.cellSize * c, this.height);
      context.stroke();
    }

    for (let r = 0; r < this.rows; r++) {
      context.beginPath();
      context.moveTo(0, this.cellSize * r);
      context.lineTo(this.width, this.cellSize * r);
      context.stroke();
    }
  }

  drawGridAngles(context: any) {
    context.save();
    context.strokeStyle = "red";
    context.lineWidth = 2;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        context.beginPath();
        context.moveTo(
          c * this.cellSize + this.cellSize / 2,
          this.cellSize * r + this.cellSize / 2
        );
        context.lineTo(
          c * this.cellSize +
            this.cellSize / 2 +
            (this.flowField[r * this.cols + c].x * this.cellSize) / 3,
          this.cellSize * r +
            this.cellSize / 2 +
            (this.flowField[r * this.cols + c].y * this.cellSize) / 3
        );
        context.stroke();
        context.fillText(
          Math.round(this.flowField[r * this.cols + c].x),
          c * this.cellSize + this.cellSize / 2,
          this.cellSize * r + this.cellSize / 2
        );
      }
    }
    context.restore();
  }
}

const Page = (props: Props) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      const canvasElement: any = canvasRef.current;

      canvasElement.width = window.innerWidth;
      canvasElement.height = window.innerHeight;

      let canvasCtx = canvasElement.getContext("2d");

      canvasCtx.strokeStyle = "white";
      canvasCtx.fillStyle = "white";
      canvasCtx.lineCap = "round";

      let effect = new Effect(canvasElement, canvasCtx);

      effect.render(canvasCtx);

      const animate = () => {
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        effect.render(canvasCtx);

        // effect.drawGrid(canvasCtx);
        // effect.drawGridAngles(canvasCtx);

        requestAnimationFrame(animate);
      };

      animate();
    }
  }, []);

  return <canvas ref={canvasRef}></canvas>;
};

export default Page;
