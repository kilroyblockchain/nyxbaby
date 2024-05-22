import React, { useState, useEffect, useRef } from 'react';
import CustomAudioPlayer from "./CustomAudioPlayer";
import TooltipIcon from './TooltipIcon';
import './controlstyles.css'; // Ensure this import is correct

const DragAndDropMediaPlayer = () => {
    const [files, setFiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [manifest, setManifest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (files.length > 0) {
            // The fileURL is used directly in the CustomAudioPlayer
            URL.createObjectURL(files[currentIndex]);
        }
    }, [files, currentIndex]);

    const handleDrop = (event) => {
        event.preventDefault();
        const audioFiles = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('audio/'));
        setFiles(audioFiles); // Replace current files with new ones
        setCurrentIndex(0); // Reset the current index
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleFileChange = (event) => {
        const audioFiles = Array.from(event.target.files).filter(file => file.type.startsWith('audio/'));
        setFiles(audioFiles); // Replace current files with new ones
        setCurrentIndex(0); // Reset the current index
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        setManifest(null);

        const formData = new FormData();
        formData.append('file', files[currentIndex]);

        try {
            const response = await fetch('https://paybots-claim-engine.azurewebsites.net/api/manifest', {
                method: 'POST',
                body: formData,
            });

            if (response.status === 500) {
                throw new Error("No Manifest Found");
            }

            if (!response.ok) {
                throw new Error(`Manifest retrieval failed with status: ${response.status}`);
            }

            const responseData = await response.json();
            setManifest(responseData);
        } catch (error) {
            console.error('Error retrieving manifest:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : files.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < files.length - 1 ? prevIndex + 1 : 0));
    };

    return (
        <div className="drag-drop-media-player">
            <h1>Drag and Drop Audio Player</h1>
            <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ border: '2px dashed #007bff', borderRadius: '10px', padding: '20px', textAlign: 'center' }}
                onClick={handleButtonClick} // Make the drop zone clickable
            >
                <p>Drag & drop audio files here, or click to select files</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="audio/*"
                    style={{ display: 'none' }}
                />
            </div>

            {files.length > 0 && (
                <>
                    <div className="media-player" style={{ marginTop: '20px' }}>
                        <p>Now Playing: {files[currentIndex].name}</p>
                        <CustomAudioPlayer
                            src={URL.createObjectURL(files[currentIndex])}
                            onEnded={handleNext}
                            onPrev={handlePrev}
                            onNext={handleNext}
                        />
                    </div>
                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <TooltipIcon title="Check currently playing file for a C2PA manifest and display the JSON." />
                        <button type="submit" disabled={isLoading || !files.length}>
                            Retrieve Manifest
                        </button>
                    </form>
                    {isLoading && <p>Retrieving...</p>}
                    {error && <p className="error">{error}</p>}
                    {manifest && (
                        <div>
                            <h2>Manifest</h2>
                            <pre>{JSON.stringify(manifest, null, 2)}</pre>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DragAndDropMediaPlayer;
