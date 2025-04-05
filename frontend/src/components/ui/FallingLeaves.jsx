import React from 'react';
import { Leaf } from 'lucide-react';

const FallingLeaves = () => {
  // Create a larger number of leaves (80) to make them more noticeable
  const leaves = Array.from({ length: 80 });
  
  return (
    <div className="falling-leaves-container">
      {leaves.map((_, index) => {
        // Randomize leaf appearance and animation
        const size = 12 + Math.floor(Math.random() * 20);
        const opacity = 0.3 + Math.random() * 0.5;
        const animationDuration = 15 + Math.random() * 25;
        const animationDelay = Math.random() * 30;
        const leftPosition = Math.random() * 100;
        const rotation = Math.random() * 360;
        
        // Vary the colors for better visibility
        const colors = [
          'text-green-400',
          'text-green-500',
          'text-green-600',
          'text-yellow-400',
          'text-yellow-500',
          'text-orange-400',
        ];
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={`falling-leaf-${index}`}
            className="falling-leaf"
            style={{
              left: `${leftPosition}%`,
              transform: `rotate(${rotation}deg)`,
              animationDuration: `${animationDuration}s`,
              animationDelay: `${animationDelay}s`,
              opacity,
              zIndex: 5, // Increase z-index to ensure visibility
            }}
          >
            <Leaf
              size={size}
              className={colorClass}
              strokeWidth={1.5}
            />
          </div>
        );
      })}
      
      <style jsx>{`
        .falling-leaves-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 5;
        }
        
        .falling-leaf {
          position: absolute;
          top: -10%;
          animation: leafFall linear infinite, leafSway ease-in-out infinite alternate;
        }
        
        @keyframes leafFall {
          0% {
            top: -10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }
        
        @keyframes leafSway {
          0% {
            margin-left: -30px;
            transform: rotate(-30deg);
          }
          25% {
            margin-left: 15px;
            transform: rotate(10deg);
          }
          50% {
            margin-left: -15px;
            transform: rotate(-15deg);
          }
          75% {
            margin-left: 5px;
            transform: rotate(5deg);
          }
          100% {
            margin-left: -10px;
            transform: rotate(-10deg);
          }
        }
        
        /* Create variation in leaf behavior */
        .falling-leaf:nth-child(2n) {
          animation-duration: 22s, 6s;
        }
        
        .falling-leaf:nth-child(3n) {
          animation-duration: 18s, 4s;
        }
        
        .falling-leaf:nth-child(5n) {
          animation-duration: 25s, 7s;
        }
        
        .falling-leaf:nth-child(7n) {
          animation-duration: 15s, 5s;
        }
      `}</style>
    </div>
  );
};

export default FallingLeaves;