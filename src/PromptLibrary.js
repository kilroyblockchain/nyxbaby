import React, { useState, useRef } from 'react';

const PromptLibrary = () => {
    const [prompt, setPrompt] = useState('');
    const [prompts, setPrompts] = useState([]);
    const canvasRef = useRef(null);

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const storePrompt = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 600;
        canvas.height = 100;

        // Set styles
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '18px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(prompt, 10, 50);

        // Save the image data
        const imageData = canvas.toDataURL('image/png');
        setPrompts([...prompts, imageData]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        storePrompt();
        setPrompt(''); // Clear the prompt input after storing
    };

    return (
        <div>
            <h1>Prompt Library</h1>
            <form onSubmit={handleSubmit}>
        <textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter your prompt"
            rows="4"
            cols="50"
        />
                <button type="submit">Store Prompt</button>
            </form>
            <div>
                {prompts.map((imageData, index) => (
                    <img key={index} src={imageData} alt={`Prompt ${index + 1}`} />
                ))}
            </div>
            {/* Hidden canvas element */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default PromptLibrary;
