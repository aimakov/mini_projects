"use client";

import React, { useEffect, useRef } from "react";

type Props = {};

class Particle {
    x: number;
    y: number;
    effect: any;
    speedX: any;
    speedY: any;
    history: any[];
    maxLength: number;
    angle: number;
    speedModifier: number;
    timer: number;

    constructor(effect: any) {
        this.effect = effect;
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.speedX;
        this.speedY;
        this.speedModifier = Math.floor(Math.random() * 5 + 2);
        this.history = [{ x: this.x, y: this.y }];
        this.maxLength = Math.floor(Math.random() * 200 + 10);
        this.angle = 0;
        this.timer = this.maxLength * 2;
    }

    draw(context: any) {
        // context.fillRect(this.x, this.y, 10, 10);
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);

        for (let i = 0; i < this.history.length; i++) {
            context.lineTo(this.history[i].x, this.history[i].y);
        }

        context.stroke();
    }

    update() {
        this.timer--;

        if (this.timer >= 1) {
            let x = Math.floor(this.x / this.effect.cellSize);
            let y = Math.floor(this.y / this.effect.cellSize);

            let index = y * this.effect.cols + x;
            this.angle = this.effect.flowField[index];

            this.speedX = Math.cos(this.angle);
            this.speedY = Math.sin(this.angle);

            this.x += this.speedX * this.speedModifier;
            this.y += this.speedY * this.speedModifier;

            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > this.maxLength) {
                this.history.shift();
            }
        } else if (this.history.length > 1) {
            this.history.shift();
        } else {
            this.reset();
        }
    }

    reset() {
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);

        this.history = [{ x: this.x, y: this.y }];

        this.timer = this.maxLength * 2;
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
    flowField: number[];
    curve: number;
    zoom: number;
    debug: boolean;
    canvas: any;
    context: any;

    constructor(canvas: any, context: any) {
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 1000;
        this.cellSize = 30;
        this.rows;
        this.cols;
        this.flowField = [];
        this.curve = 0.2;
        this.zoom = 0.1;
        this.debug = false;
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

    init() {
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);
        this.flowField = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
                this.flowField.push(angle);
            }
        }

        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
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
                    c * this.cellSize + this.cellSize / 2 + (Math.cos(this.flowField[r * this.cols + c]) * this.cellSize) / 3,
                    this.cellSize * r + this.cellSize / 2 + (Math.sin(this.flowField[r * this.cols + c]) * this.cellSize) / 3
                );
                context.stroke();
                // context.fillText(Math.round(this.flowField[r * this.cols + c]), c * this.cellSize + this.cellSize / 2, this.cellSize * r + this.cellSize / 2);
            }
        }
        context.restore();
    }

    render(context: any) {
        this.particles.forEach((particle) => {
            particle.draw(context);
            particle.update();
        });
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
                if (effect.debug) {
                    effect.drawGrid(canvasCtx);
                    effect.drawGridAngles(canvasCtx);
                }

                requestAnimationFrame(animate);
            };

            animate();
        }
    }, []);

    return <canvas ref={canvasRef}></canvas>;
};

export default Page;
