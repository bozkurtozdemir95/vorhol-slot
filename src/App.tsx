import React, {useState} from 'react';
import {Stage} from '@pixi/react';
import SlotMachine from './components/SlotMachine';
import logo from './assets/img/vorhol.svg';
import './index.css';

const App : React.FC = () => {
    const [spinDuration,
        setSpinDuration] = useState(1500);
    const [spinSpeed,
        setSpinSpeed] = useState(40);

    const handleSpinDurationChange = (event : React.ChangeEvent < HTMLInputElement >) => {
        const value = Number(event.target.value);
        if (!isNaN(value) && value >= 500) {
            setSpinDuration(value);
        }
    };

    const handleSpinSpeedChange = (event : React.ChangeEvent < HTMLInputElement >) => {
        const value = Number(event.target.value);
        if (!isNaN(value) && value > 0) {
            setSpinSpeed(value);
        }
    };

    return (
        <div
            className="min-h-screen bg-neutral-300 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 flex justify-center">
                <div className="relative flex flex-col items-center px-4 py-10 bg-gray-100 shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="flex items-center text-2xl font-bold text-yellow-400 mb-5">
                        <img className='mr-2 w-24' src={logo} alt="VORHOL" /> 
                        SLOT
                    </div>
                    <div
                        id="pixi-container"
                        style={{
                        width: '900px',
                        height: '600px',
                        border: '1px solid black'
                    }}>
                        <Stage
                            width={900}
                            height={600}
                            options={{
                            backgroundColor: 0x252020
                        }}>
                            <SlotMachine
                                reels={5}
                                rows={5}
                                symbols={[
                                'cherry',
                                'lemon',
                                'orange',
                                'plum',
                                'banana',
                                'bars',
                                'bigwin',
                                'seven',
                                'watermelon'
                            ]}
                                spinDuration={spinDuration}
                                spinSpeed={spinSpeed}/>
                        </Stage>
                    </div>
                    <div className="flex mt-4">
                        <div className="flex items-center justify-center mr-4">
                            <label className="mr-2 text-gray-800 font-semibold">Spin Duration (ms):</label>
                            <input
                                type="number"
                                step={100}
                                value={spinDuration}
                                onChange={handleSpinDurationChange}
                                className="border border-gray-300 rounded-md p-1"/>
                        </div>

                        <div className="flex items-center justify-center">
                            <label className="mr-2 text-gray-800 font-semibold">Spin Speed:</label>
                            <input
                                type="number"
                                value={spinSpeed}
                                step={10}
                                onChange={handleSpinSpeedChange}
                                className="border border-gray-300 rounded-md p-1"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
