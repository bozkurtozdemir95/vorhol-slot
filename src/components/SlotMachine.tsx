import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Sprite, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { GameService } from '../services/game.service';
import audioService from '../services/audio.service';


interface SlotMachineProps {
  reels: number;
  rows: number;
  symbols: string[];
  spinDuration?: number;
  spinSpeed?: number;
}

const SlotMachine: React.FC<SlotMachineProps> = ({
  reels: initialReels = 5,
  rows: initialRows = 5,
  symbols,
  spinDuration = 3000,
  spinSpeed = 30,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(initialReels);
  const [rows, setRows] = useState(initialRows);
  const [reelPositions, setReelPositions] = useState<number[]>([]);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([]);
  const [betAmount, setBetAmount] = useState(5);
  const [showLinesDropup, setShowLinesDropup] = useState(false);
  const [showColsDropup, setShowColsDropup] = useState(false);
  const [showBetAmounts, setShowBetAmounts] = useState(false);
  const [balance, setBalance] = useState(GameService.getBalance());
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [betIndex, setBetIndex] = useState(0); 
  const [clickedFirstTime, setClickedFirstTime] = useState(false);

  const machineWidth = 900;
  const machineHeight = 600;
  const reelsWidth = machineWidth * 0.95;
  const reelsHeight = machineHeight * 0.75; 
  const borderWidth = 4;
  const buttonWidth = 120;
  const buttonWidthSmall = 60;
  const buttonHeight = 40;
  const buttonSpacing = 20;
  const topPadding = 60;

  const reelWidth = (reelsWidth - (reels + 1) * borderWidth) / reels;
  const symbolHeight = (reelsHeight - (rows + 1) * borderWidth) / rows;
  const symbolSize = Math.min(reelWidth * 0.8, symbolHeight * 0.8);

  const textures = useMemo(() => symbols.map(symbol =>  PIXI.Texture.from(require(`../assets/img/${symbol}.png`))),  [symbols]);
  const blurFilter = useMemo(() => new PIXI.BlurFilter(8), []);

  useEffect(() => {
    setReelPositions(Array(reels).fill(0));
    setStoppedReels(Array(reels).fill(true));
  }, [reels]);

  useEffect(() => {
    if (clickedFirstTime) {
      audioService.playBackgroundMusic();
      return () => {
        audioService.stopBackgroundMusic();
      };
    }
  }, [clickedFirstTime]);

  const handleUserClick = () => {
    if (!clickedFirstTime) {
      setClickedFirstTime(true);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleUserClick);
    return () => {
      document.removeEventListener('click', handleUserClick);
    };
  }, [clickedFirstTime]);
  
  const spin = useCallback(() => {
    if (spinning) return;
    try {
      const newBalance = GameService.spin(betAmount);
      setBalance(newBalance);
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
            audioService.playStopSound();
            return newStoppedReels;
          });
          stopReels(reelIndex + 1);
        }, spinDuration / reels);
      };
  
      setTimeout(() => stopReels(0), spinDuration);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  }, [spinning, reels, spinDuration, betAmount]);
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setReelPositions(prev => prev.map((pos, index) => 
        stoppedReels[index] 
          ? Math.round(pos / symbolHeight) * symbolHeight 
          : (pos - spinSpeed + symbols.length * symbolHeight) % (symbols.length * symbolHeight)
      ));
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [symbols.length, symbolHeight, stoppedReels, spinSpeed]);

  
  const backgroundTexture = useMemo(() => PIXI.Texture.from(require('../assets/img/slot-bg.png')), []);

  const drawBackground = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginTextureFill({ texture: backgroundTexture });
    g.drawRect(0, 0, machineWidth, machineHeight);
    g.endFill();

    // Draw the border around the reels
    g.lineStyle(borderWidth * 2, 0xFFD700, 1);
    g.drawRoundedRect(
      (machineWidth - reelsWidth) / 2 - borderWidth,
      topPadding - borderWidth,
      reelsWidth + borderWidth * 2,
      reelsHeight + borderWidth * 2,
      10
    );
  }, [machineWidth, machineHeight, reelsWidth, reelsHeight, borderWidth, topPadding, backgroundTexture]);

  const drawGradientBorder = useCallback((g: PIXI.Graphics, x: number, y: number, width: number, height: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#FDB931');
    gradient.addColorStop(0.5, '#FFFFAC');
    gradient.addColorStop(1, '#FDB931');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const borderTexture = PIXI.Texture.from(canvas);
    g.beginTextureFill({ texture: borderTexture });
    g.drawRect(x, y, width, height);
    g.endFill();
  }, []);

  const drawButton = useCallback((label: string, g: PIXI.Graphics, hovered: boolean) => {
    
    g.clear();
    g.lineStyle(2, 0xFFFFAC, 1);
    g.beginFill(hovered ? 0xFDC031 : 0xFDB931, 1);
  label !== 'SPIN' ? 
    g.drawRoundedRect(0, 0, label === '+' || label === '-' ? buttonWidthSmall : buttonWidth, buttonHeight, 10) :
    g.drawRoundedRect(0, 0, buttonWidthSmall, buttonWidthSmall, 40);
    g.endFill();
  }, [buttonWidth, buttonHeight]);

  const drawDropup = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.lineStyle(2, 0xFFFFAC, 1);
    g.beginFill(0xFDB931, 1);
    g.drawRoundedRect(0, 0, buttonWidth, 140, 10);
    g.endFill();
  }, [buttonWidth]);

  const drawDropupOption = useCallback((g: PIXI.Graphics, hovered: boolean) => {
    g.clear();
    g.beginFill(hovered ? 0xFDC031 : 0xFDB931, 1);
    g.drawRect(0, 0, buttonWidth, 35);
    g.endFill();
  }, [buttonWidth]);

  const drawReelOverlay = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0x000000, 0.3);
    g.drawRect(0, 0, reelsWidth, reelsHeight);
    g.endFill();
  }, [reelsWidth, reelsHeight]);

  const renderDropup = useCallback((options: number[], setter: (value: number) => void, closeDropup: () => void) => (
    <Container y={options.length * -35}>
      <Graphics draw={drawDropup} />
      {options.map((option, index) => (
        <Container
          key={option}
          y={35 * index + 5}
          eventMode="static"
          cursor="pointer"
          pointerover={() => setHoveredOption(option)}
          pointerout={() => setHoveredOption(null)}
          pointerdown={() => {
            audioService.playClickSound();
            setter(option); // This should be updating the betAmount
            setBetAmount(option); // Ensure this updates the betAmount directly
            closeDropup();
          }}
        >
          <Graphics draw={(g) => drawDropupOption(g, hoveredOption === option)} />
          <Text
            text={option.toString()}
            x={buttonWidth / 2}
            y={17.5}
            anchor={0.5}
            style={new PIXI.TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fontWeight: 'bold',
              fill: '#222222',
            })}
          />
        </Container>
      ))}
    </Container>
  ), [drawDropup, drawDropupOption, buttonWidth, hoveredOption]);

  return (
    <Container>
      <Graphics draw={drawBackground} />
      
      <Text
        text={`BALANCE: ${balance} BET: ${betAmount}`} 
        x={20}
        y={10}
        style={new PIXI.TextStyle({
          fontFamily: 'sans-serif',
          fontSize: 20,
          fontWeight: 'bold',
          fill: '#FFFFFF',
        })}
      />
      
      <Container x={(machineWidth - reelsWidth) / 2} y={topPadding}>
        <Container
          mask={new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0, 0, reelsWidth + 60, reelsHeight + 60).endFill()}
        >
          <Graphics draw={drawReelOverlay} />
          
          {Array.from({ length: reels }).map((_, reelIndex) => (
            <Container key={reelIndex} x={reelIndex * (reelWidth + borderWidth)}>
              <Graphics draw={(g) => drawGradientBorder(g, -borderWidth / 2, 0, borderWidth, reelsHeight)} />
              <Container
              y={25}
                mask={new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0, 0, reelWidth * reels + 60, reelsHeight + 60).endFill()}
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
      </Container>

      <Container y={machineHeight - 70}>
        {['LINES', 'COLS', '-', 'BET', '+', 'SPIN'].map((label, index) => (
          <Container
            key={label}
            x={20 + index * (label === 'BET' ? buttonWidth :  label === '+' ? buttonWidthSmall * 2 + 5 : label === 'SPIN' ?  buttonWidth * 1.35 : buttonWidth + buttonSpacing)}
            eventMode="static"
            cursor="pointer"
            pointerdown={() => {
              audioService.playClickSound();
              if (label === 'LINES') setShowLinesDropup(!showLinesDropup);
              if (label === 'COLS') setShowColsDropup(!showColsDropup);
              if (label === '-') {
                const newBetIndex = Math.max(betIndex - 1, 0);
                setBetIndex(newBetIndex);
                setBetAmount(GameService.getAvailableAmounts()[newBetIndex]);
              }
              if (label === 'BET') {
                setShowBetAmounts(prev => !prev);
              }
              if (label === '+') {
                const newBetIndex = Math.min(betIndex + 1, GameService.getAvailableAmounts().length - 1);
                setBetIndex(newBetIndex);
                setBetAmount(GameService.getAvailableAmounts()[newBetIndex]);
              }
              if (label === 'SPIN') spin();
            }}
            pointerover={() => setHoveredButton(label)}
            pointerout={() => setHoveredButton(null)}
          >
            <Graphics draw={(g) => drawButton(label, g, hoveredButton === label)} />
            <Text
              text={`${label}${label !== 'SPIN' ? '' : ''}${
                label === 'LINES' ? ': ' + rows :
                label === 'COLS' ? ': ' + reels :
                label === 'BET' ? ': ' + GameService.getAvailableAmounts()[betIndex] :
                ''
              }`.trim()}
              anchor={0.5}
              x={label === '+' || label === '-' ? buttonWidthSmall / 2  : label === 'SPIN' ? buttonWidth / 4 : buttonWidth / 2 }
              y={label === 'SPIN' ? buttonWidth / 4  : buttonHeight / 2}
              style={new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fontWeight: 'bold',
                fill: '#222222',
              })}
            />
            {label === 'LINES' && showLinesDropup && renderDropup([3, 4, 5, 6], setRows, () => setShowLinesDropup(false))}
            {label === 'COLS' && showColsDropup && renderDropup([3, 4, 5, 6], setReels, () => setShowColsDropup(false))}
            {label === '-' && showBetAmounts}
            {label === 'BET' && showBetAmounts && renderDropup(GameService.getAvailableAmounts(), (value) => {
            setBetAmount(value);
            setBetIndex(GameService.getAvailableAmounts().indexOf(value));
          }, () => setShowBetAmounts(false))}
            {label === '+' && showBetAmounts}
          </Container>
        ))}
      </Container>

    </Container>
  );
};

export default SlotMachine;