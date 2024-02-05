import React, { useState, useRef } from 'react';

const PromptLibrary = () => {
    const [prompt, setPrompt] = useState('');
    const [prompts, setPrompts] = useState([]);
    const canvasRef = useRef(null);

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    };

    const storePrompt = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions large enough for wrapping text
        canvas.width = 800;
        canvas.height = 1000;

        // Set styles
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '18px Arial';
        ctx.fillStyle = 'black';

        // Wrap text and draw it to the canvas
        wrapText(ctx, prompt, 10, 30, canvas.width - 20, 25); // 20px for padding, 25px line height

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
            <div className={"promptLibrary"}>
                {prompts.map((imageData, index) => (
                    <div key={index}>
                        <img src={imageData} alt={`Prompt ${index + 1}`} />
                        <a href={imageData} download={`prompt-${index + 1}.png`}>
                            Download Prompt {index + 1}
                        </a>
                    </div>
                ))}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default PromptLibrary;
