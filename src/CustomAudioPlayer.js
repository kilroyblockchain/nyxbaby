import React, { useRef, useEffect } from 'react';
import AudioControls from './AudioControls';
import './controlstyles.css';

const CustomAudioPlayer = ({ src, onEnded, onPrev, onNext }) => {
    const audioRef = useRef(null);

    useEffect(() => {
        const audioElement = audioRef.current;

        const handleLoadedData = () => {
            if (audioElement) {
                audioElement.play().catch(error => console.error('Audio play error:', error));
            }
        };

        if (audioElement) {
            audioElement.addEventListener('loadeddata', handleLoadedData);
            audioElement.src = src;

            // Check initial state
            if (!audioElement.paused) {
                audioElement.play().catch(error => console.error('Audio play error:', error));
            }
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('loadeddata', handleLoadedData);
            }
        };
    }, [src]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <AudioControls ref={audioRef} src={src} onPrev={onPrev} onNext={onNext} />
        </div>
    );
};

export default CustomAudioPlayer;
