
'use client';

import React, { useState, useEffect, useMemo } from 'react';

const NUM_DOTS = 50;
const RADIUS_BASE = 20;
const DOT_RADIUS = 1.5;

interface Dot {
  angle: number;
  initialRadius: number;
  speed: number;
  opacity: number;
}

const colors = {
    thinking: 'hsl(var(--primary))',
    buy: 'hsl(var(--chart-2))',
    sell: 'hsl(var(--chart-1))',
    profit: 'hsl(142 76% 36%)',
    loss: 'hsl(0 84.2% 60.2%)',
};

export const MachineBrainIcon = ({ status }: { status: 'thinking' | 'buy' | 'sell' | 'profit' | 'loss' }) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const initialDots: Dot[] = [];
    for (let i = 0; i < NUM_DOTS; i++) {
      initialDots.push({
        angle: (i / NUM_DOTS) * Math.PI * 2,
        initialRadius: RADIUS_BASE * (0.5 + Math.random() * 0.5),
        speed: 0.5 + Math.random() * 0.5,
        opacity: 0.5 + Math.random() * 0.5,
      });
    }
    setDots(initialDots);
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setTime(t => t + 0.01));
    return () => cancelAnimationFrame(animationFrame);
  }, [time]);
  
  const getDotProps = (dot: Dot, index: number) => {
    let radius = dot.initialRadius;
    let opacity = dot.opacity;
    const color = colors[status];
    let key = `${index}-${status}`; // Force re-render on status change

    switch (status) {
        case 'thinking':
            radius = dot.initialRadius * (1 + Math.sin(time * dot.speed) * 0.1);
            break;
        case 'buy':
        case 'sell':
        case 'profit':
        case 'loss':
             // A quick pulse effect
            const pulseTime = time % 1.5; // Loop animation every 1.5s
            const pulseFactor = Math.exp(-pulseTime * 2) * Math.sin(pulseTime * Math.PI * 2);
            radius = dot.initialRadius * (1 + pulseFactor * 0.5);
            opacity = Math.max(0.2, 1 - pulseTime);
            break;
    }
    
    return {
        key: key,
        cx: 25 + radius * Math.cos(dot.angle),
        cy: 25 + radius * Math.sin(dot.angle),
        r: DOT_RADIUS,
        fill: color,
        style: { opacity, transition: 'fill 0.3s ease' }
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
