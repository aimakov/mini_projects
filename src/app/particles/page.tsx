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
        this.x = (Math.random() * this.effect.width) / 50;
        this.y = (Math.random() * this.effect.height) / 50 + (this.effect.height * 4) / 5 + (Math.random() - 0.5) * 20;
        this.radius = Math.random() * 3 + 2;
        // this.speedModifier = Math.random() + 1;
        this.speedModifier = 1;

        this.speedX = 10;
        this.speedY = 0;
    }

    draw(context: any) {
        // context.fillRect(this.x, this.y, 10, 10);
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }

    update() {
        let x = Math.floor(this.x / this.effect.cellSize);
        let y = Math.floor(this.y / this.effect.cellSize);

        let index = y * this.effect.cols + x;
        // this.x += this.speedX;

        this.speedX += this.effect.flowField[index].x * 0.5;
        this.speedY += this.effect.flowField[index].y * 0.5;

        this.x += this.speedX * this.speedModifier;
        this.y += this.speedY * this.speedModifier;

        // if (this.x > this.effect.width / 2) {
        //     this.x = 0;
        // }
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

    constructor(canvas: any, context: any) {
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 1;
        this.cellSize = 30;
        this.rows;
        this.cols;
        this.flowField = [];
        this.curve = 0.2;
        this.zoom = 0.1;
        this.debug = false;

        this.center = { x: this.width / 2, y: this.height / 2 };

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

    getSpiralFieldVector(pointX: number, pointY: number) {
        // Calculate difference in x and y coordinates
        const dx = pointX - this.center.x;
        const dy = pointY - this.center.y;
        // Calculate angle and distance from the center
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Set spiral parameters
        const spiralDensity = 0.01; // Adjust the density of the spiral
        const spiralConstant = 0.1; // Adjust the strength of the spiral
        // Calculate spiral field vector components
        const spiralX = Math.cos(angle) * distance * spiralDensity + Math.sin(distance * spiralDensity) * spiralConstant;
        const spiralY = Math.sin(angle) * distance * spiralDensity - Math.cos(distance * spiralDensity) * spiralConstant;
        return { x: -spiralX, y: -spiralY };
    }

    init() {
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);
        this.flowField = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.flowField.push(this.getSpiralFieldVector((x + 0.5) * this.cellSize, (y + 0.5) * this.cellSize));
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
                context.moveTo(c * this.cellSize + this.cellSize / 2, this.cellSize * r + this.cellSize / 2);
                context.lineTo(
                    c * this.cellSize + this.cellSize / 2 + (this.flowField[r * this.cols + c].x * this.cellSize) / 3,
                    this.cellSize * r + this.cellSize / 2 + (this.flowField[r * this.cols + c].y * this.cellSize) / 3
                );
                context.stroke();
                context.fillText(Math.round(this.flowField[r * this.cols + c].x), c * this.cellSize + this.cellSize / 2, this.cellSize * r + this.cellSize / 2);
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
                // effect.render(canvasCtx);
                effect.drawGrid(canvasCtx);
                effect.drawGridAngles(canvasCtx);

                requestAnimationFrame(animate);
            };

            animate();
        }
    }, []);

    return <canvas ref={canvasRef}></canvas>;
};

export default Page;
