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
    angle = 0;

    constructor(effect: any) {
        this.effect = effect;
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.speedX = Math.random() * 5 - 2.5;
        this.speedY = Math.random() * 5 - 2;
        this.history = [{ x: this.x, y: this.y }];
        this.maxLength = Math.floor(Math.random() * 100 + 10);
        this.angle = 0;
    }

    draw(context: any) {
        context.fillRect(this.x, this.y, 10, 10);
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);

        for (let i = 0; i < this.history.length; i++) {
            context.lineTo(this.history[i].x, this.history[i].y);
        }

        context.stroke();
    }

    update() {
        this.angle += 0.5;
        this.x += this.speedX * Math.sin(this.angle) * 3;
        this.y += this.speedY * Math.cos(this.angle);
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxLength) {
            this.history.shift();
        }
    }
}

class Effect {
    width: number;
    height: number;
    particles: any[];
    numberOfParticles: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.particles = [];
        this.numberOfParticles = 50;
        this.init();
    }

    init() {
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
}

const Page = (props: Props) => {
    const canvasRef = useRef();

    useEffect(() => {
        if (canvasRef.current) {
            const canvasElement: any = canvasRef.current;

            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;

            const canvasCtx = canvasElement.getContext("2d");

            canvasCtx.strokeStyle = "white";
            canvasCtx.fillStyle = "white";
            canvasCtx.lineCap = "round";

            // canvasCtx.beginPath();
            // canvasCtx.moveTo(100, 100);
            // canvasCtx.lineTo(200, 200);
            // canvasCtx.stroke();

            const effect = new Effect(canvasElement.width, canvasElement.height);
            effect.render(canvasCtx);
            console.log(effect);

            const animate = () => {
                canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                effect.render(canvasCtx);
                requestAnimationFrame(animate);
            };

            animate();
        }
    }, []);

    return <canvas ref={canvasRef}></canvas>;
};

export default Page;
