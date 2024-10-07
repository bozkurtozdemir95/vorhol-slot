import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Stage, Container, Sprite, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface SlotMachineProps {
  reels: number;
  rows: number;
  symbols: string[];
  spinDuration?: number;
  spinSpeed?: number;
}

const SlotMachine: React.FC<SlotMachineProps> = ({
  reels = 5,
  rows = 5,
  symbols,
  spinDuration = 3000,
  spinSpeed = 30,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [reelPositions, setReelPositions] = useState<number[]>(Array(reels).fill(0));
  const [stoppedReels, setStoppedReels] = useState<boolean[]>(Array(reels).fill(true));

  const machineWidth = 800;
  const machineHeight = 600;
  const reelsWidth = machineWidth * 0.95;
  const reelsHeight = machineHeight * 0.8;  // Increased to take more vertical space
  const borderWidth = 2;

  const reelWidth = (reelsWidth - (reels + 1) * borderWidth) / reels;
  const symbolHeight = (reelsHeight - (rows + 1) * borderWidth) / rows;
  const symbolSize = Math.min(reelWidth * 0.9, symbolHeight);

  const textures = useMemo(() => symbols.map(symbol => PIXI.Texture.from(`/img/${symbol}.png`)), [symbols]);
  const blurFilter = useMemo(() => new PIXI.filters.BlurFilter(8), []);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setStoppedReels(Array(reels).fill(false));

    const stopReels = (reelIndex: number) => {
      if (reelIndex >= reels) {
        setSpinning(false);
        return;
      }
      setTimeout(() => {
        setStoppedReels(prev => {
          const newStoppedReels = [...prev];
          newStoppedReels[reelIndex] = true;
          return newStoppedReels;
        });
        stopReels(reelIndex + 1);
      }, spinDuration / reels);
    };

    setTimeout(() => stopReels(0), spinDuration);
  }, [spinning, reels, spinDuration]);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setReelPositions(prev => prev.map((pos, index) => 
        stoppedReels[index] 
          ? Math.round(pos / symbolHeight) * symbolHeight 
          : (pos + spinSpeed) % (symbols.length * symbolHeight)
      ));
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [symbols.length, symbolHeight, stoppedReels, spinSpeed]);

  return (
    <Stage options={{ backgroundColor: 0x800080, width: machineWidth, height: machineHeight }}>
      <Container>
        {/* Background and border for reels */}
        <Graphics
          draw={g => {
            g.clear();
            g.lineStyle(borderWidth * 2, 0xFF00FF, 1);
            g.beginFill(0x400040);
            g.drawRect((machineWidth - reelsWidth) / 2, 40, reelsWidth, reelsHeight);
            g.endFill();
          }}
        />
        
        {/* Balance display */}
        <Text
          text="BALANCE: 10000"
          x={20}
          y={10}
          style={new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: '#FFFFFF',
          })}
        />
        
        {/* Reels and Symbols */}
        <Container x={(machineWidth - reelsWidth) / 2 + borderWidth} y={40 + borderWidth}>
          {Array.from({ length: reels }).map((_, reelIndex) => (
            <Container key={reelIndex} x={reelIndex * (reelWidth + borderWidth)}>
              {/* Reel background */}
              <Graphics
                draw={g => {
                  g.clear();
                  g.beginFill(0x300030);
                  g.drawRect(0, 0, reelWidth, reelsHeight - 2 * borderWidth);
                  g.endFill();
                }}
              />
              {/* Symbols */}
              <Container
                mask={new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0, 0, reelWidth * reels, reelsHeight + (rows  * 6)).endFill()}
                filters={!stoppedReels[reelIndex] ? [blurFilter] : []}
              >
                {Array.from({ length: symbols.length + rows }).map((_, symbolIndex) => {
                  const y = ((symbolIndex * symbolHeight - reelPositions[reelIndex]) % (symbols.length * symbolHeight) + symbols.length * symbolHeight) % (symbols.length * symbolHeight);
                  return (
                    <Sprite
                      key={symbolIndex}
                      texture={textures[symbolIndex % symbols.length]}
                      x={(reelWidth - symbolSize) / 2}
                      y={y}
                      width={symbolSize}
                      height={symbolSize}
                    />
                  );
                })}
              </Container>
            </Container>
          ))}
        </Container>

        {/* Control buttons */}
        <Container y={machineHeight - 60}>
          {['LINES', 'BET', 'WIN', 'SPIN', 'MAX BET', 'AUTO SPIN'].map((label, index) => (
            <Container
              key={label}
              x={20 + index * (machineWidth - 40) / 6}
              interactive={true}
              pointerdown={() => {
                if (label === 'SPIN') spin();
              }}
            >
              <Graphics
                draw={g => {
                  g.clear();
                  g.lineStyle(2, 0xFF00FF, 1);
                  g.beginFill(0x800080, 1);
                  g.drawRoundedRect(0, 0, (machineWidth - 120) / 6, 50, 10);
                  g.endFill();
                }}
              />
              <Text
                text={label}
                anchor={0.5}
                x={(machineWidth - 120) / 12}
                y={25}
                style={new PIXI.TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 18,
                  fontWeight: 'bold',
                  fill: '#FFFFFF',
                })}
              />
            </Container>
          ))}
        </Container>
      </Container>
    </Stage>
  );
};

export default SlotMachine;