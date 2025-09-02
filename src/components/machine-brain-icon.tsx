
'use client';

import React, { useState, useEffect, useMemo } from 'react';

const NUM_DOTS = 200; // Increased for density
const RADIUS_BASE = 22; // Adjusted for a good size in the container
const DOT_RADIUS = 1; // Made dots smaller for a finer look

interface Dot {
  angle: number;
  radius: number; // Will now be constant for a perfect circle
  speed: number;
  opacity: number;
  phase: number; // For more complex idle animations
}

const colors = {
    thinking: 'hsl(var(--primary))',
    buy: 'hsl(var(--chart-2))',
    sell: 'hsl(var(--chart-1))',
    profit: 'hsl(var(--chart-2))', // Profit is green like buy
    loss: 'hsl(var(--chart-1))',   // Loss is red like sell
    idle: 'hsl(var(--muted-foreground))', // A neutral, calm color
};

type Status = 'thinking' | 'buy' | 'sell' | 'profit' | 'loss' | 'idle';

export const MachineBrainIcon = ({ status }: { status: Status }) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const initialDots: Dot[] = [];
    for (let i = 0; i < NUM_DOTS; i++) {
      initialDots.push({
        angle: (i / NUM_DOTS) * Math.PI * 2,
        radius: RADIUS_BASE, // All dots at the same radius for a perfect circle
        speed: 0.3 + Math.random() * 0.4,
        opacity: 0.4 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2, // Random phase for each dot
      });
    }
    setDots(initialDots);
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setTime(t => t + 0.015));
    return () => cancelAnimationFrame(animationFrame);
  }, [time]);
  
  const getDotProps = (dot: Dot, index: number) => {
    let currentRadius = dot.radius;
    let opacity = dot.opacity;
    const color = colors[status] || colors.idle;
    let key = `${index}-${status}`; // Force re-render on status change

    switch (status) {
        case 'idle':
             // Continuous, subtle, random-like motion
             currentRadius = dot.radius + Math.sin(time * dot.speed + dot.phase) * 2;
             opacity = 0.5 + Math.sin(time * 2 * dot.speed + dot.phase) * 0.2;
             break;
        case 'thinking':
            // More focused "breathing" or "pulsing"
            currentRadius = dot.radius * (1 + Math.sin(time * 5) * 0.1);
            break;
        case 'buy':
        case 'sell':
        case 'profit':
        case 'loss':
             // A quick, sharp pulse effect for actions
            const pulseTime = time % 1.2; // Loop animation every 1.2s
            const pulseFactor = Math.exp(-pulseTime * 3) * Math.sin(pulseTime * Math.PI * 2.5);
            currentRadius = dot.radius * (1 + pulseFactor * 0.25);
            opacity = Math.max(0.1, 1 - pulseTime * 0.8);
            break;
    }
    
    return {
        key: key,
        cx: 25 + currentRadius * Math.cos(dot.angle),
        cy: 25 + currentRadius * Math.sin(dot.angle),
        r: DOT_RADIUS,
        fill: color,
        style: { opacity, transition: 'fill 0.5s ease-out' }
    };
  };

  return (
    <svg width="50" height="50" viewBox="0 0 50 50">
      <g>
        {dots.map((dot, index) => {
            const props = getDotProps(dot, index);
            return <circle {...props} />;
        })}
      </g>
    </svg>
  );
};
