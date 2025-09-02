
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { BrainStatus } from './machine-status';

const NUM_DOTS = 200;
const RADIUS_BASE = 22;
const DOT_RADIUS = 1;

interface Dot {
  id: number;
  angle: number;
  radius: number;
  speed: number;
  opacity: number;
  phase: number;
}

const colors = {
    thinking: 'hsl(var(--primary))', // Blue
    profit: 'hsl(var(--chart-2))', // Green
    loss: 'hsl(var(--chart-1))',   // Red
    idle: 'hsl(var(--muted-foreground))', // Gray
    alert: 'hsl(var(--accent))', // Yellow/Orange
    focused: 'hsl(197 37% 24%)', // Purple-ish
};

export const MachineBrainIcon = ({ status }: { status: BrainStatus }) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const initialDots: Dot[] = [];
    for (let i = 0; i < NUM_DOTS; i++) {
      initialDots.push({
        id: i,
        angle: (i / NUM_DOTS) * Math.PI * 2,
        radius: RADIUS_BASE,
        speed: 0.2 + Math.random() * 0.3,
        opacity: 0.4 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    setDots(initialDots);
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setTime(t => t + 0.015));
    return () => cancelAnimationFrame(animationFrame);
  }, [time]);
  
  const getDotProps = (dot: Dot) => {
    let currentRadius = dot.radius;
    let currentAngle = dot.angle;
    let opacity = dot.opacity;
    let color = colors[status] || colors.idle;
    const key = `${dot.id}-${status}`;
    let numVisibleDots = NUM_DOTS;

    switch (status) {
        case 'idle':
             currentRadius = dot.radius + Math.sin(time * dot.speed + dot.phase) * 1.5;
             opacity = 0.4 + Math.sin(time * 2 * dot.speed + dot.phase) * 0.2;
             numVisibleDots = Math.floor(NUM_DOTS * 0.7); // Less dense
             break;

        case 'thinking':
            currentRadius = dot.radius * (1 + Math.sin(time * 4) * 0.05);
            currentAngle += Math.sin(time * 0.5) * 0.1; // Slow swirl
            break;

        case 'alert': // High volatility, RSI extremes
             const alertPulse = Math.sin(time * 15 + dot.phase) * 4;
             currentRadius = dot.radius + alertPulse;
             currentAngle += Math.sin(time * 1) * 0.3; // Faster swirl
             opacity = 0.7 + Math.sin(time * 15 + dot.phase) * 0.3;
             break;

        case 'focused': // Just executed an order
            const focusPulseTime = (time % 1); // Loop animation
            const focusPulseFactor = Math.exp(-focusPulseTime * 4) * Math.sin(focusPulseTime * Math.PI * 2);
            currentRadius = dot.radius * (1 - focusPulseFactor * 0.3); // Sharp INWARD pulse
            opacity = Math.max(0.1, 1 - focusPulseTime);
            break;
            
        case 'profit':
            const profitPulse = Math.max(0, Math.sin(time * 8 + dot.phase * 2));
            currentRadius = dot.radius * (1 + profitPulse * 0.2); // Expansive breathing
            opacity = 0.6 + profitPulse * 0.4;
            numVisibleDots = NUM_DOTS; // Full density
            break;

        case 'loss':
            const lossPulse = Math.sin(time * 12) * 0.1;
            currentRadius = dot.radius * (1 + lossPulse); // Jittery pulse
            opacity = 0.5 + Math.random() * 0.2; // Flickering opacity
            numVisibleDots = Math.floor(NUM_DOTS * 0.8); // Slightly less dense
            break;
    }
    
    const isVisible = dot.id < numVisibleDots;

    return {
        key: key,
        cx: 25 + currentRadius * Math.cos(currentAngle),
        cy: 25 + currentRadius * Math.sin(currentAngle),
        r: DOT_RADIUS,
        fill: color,
        style: { 
            opacity: isVisible ? opacity : 0, 
            transition: 'fill 0.5s ease-out, opacity 0.3s linear' 
        }
    };
  };

  return (
    <svg width="50" height="50" viewBox="0 0 50 50">
      <g>
        {dots.map((dot) => {
            const props = getDotProps(dot);
            return <circle {...props} />;
        })}
      </g>
    </svg>
  );
};
