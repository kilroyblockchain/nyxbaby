import React, { useState, useEffect } from 'react';

const AudioControls = React.forwardRef(({ src, onPrev, onNext }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audioElement = ref.current;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
        const handleLoadedMetadata = () => setDuration(audioElement.duration);

        if (audioElement) {
            audioElement.addEventListener('play', handlePlay);
            audioElement.addEventListener('pause', handlePause);
            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

            // Check initial state
            if (!audioElement.paused) {
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('play', handlePlay);
                audioElement.removeEventListener('pause', handlePause);
                audioElement.removeEventListener('timeupdate', handleTimeUpdate);
                audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            }
        };
    }, [ref]);

    const handlePlayPause = () => {
        if (ref.current) {
            if (isPlaying) {
                ref.current.pause();
            } else {
                ref.current.play();
            }
        }
    };

    const handleSliderChange = (event) => {
        if (ref.current) {
            ref.current.currentTime = event.target.value;
            setCurrentTime(event.target.value);
        }
    };

    return (
        <div className="audio-controls">
            <button onClick={onPrev}>⏮️</button>
            <button onClick={handlePlayPause}>
                {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button onClick={onNext}>⏭️</button>
            <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSliderChange}
                style={{ margin: '0 10px' }}
            />
            <audio ref={ref} className="custom-audio" src={src} style={{ display: 'none' }} />
        </div>
    );
});

export default AudioControls;
