
import React, { useEffect, useState } from 'react';

const BubbleBackground: React.FC = () => {
  const [bubbles, setBubbles] = useState<{ id: number; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 15 + 5}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 4}s`
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration
          }}
        />
      ))}
    </div>
  );
};

export default BubbleBackground;
