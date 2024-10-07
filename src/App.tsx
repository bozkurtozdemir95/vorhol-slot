import React, { useMemo } from 'react';
import { Application } from 'pixi.js';
import { AppProvider } from '@pixi/react';
import SlotMachine from './components/SlotMachine';
import './index.css';

const App: React.FC = () => {
  const app = useMemo(() => new Application({
    width: 900,
    height: 600,
    backgroundColor: 0x1099bb,
  }), []);

  return (
    <AppProvider value={app}>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <h1 className="text-4xl font-bold mb-5 text-center text-gray-800">Slot Machine</h1>
            <SlotMachine
              reels={5}
              rows={5}
              symbols={['cherry', 'lemon', 'orange', 'plum', 'banana', 'bars', 'bigwin', 'seven', 'watermelon']}
              spinDuration={1000}
              spinSpeed={10}
            />
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;