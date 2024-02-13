import React, { useState, useRef } from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);

const TextToImage = () => {
    const [prompt, setPrompt] = useState('');
    const [prompts, setPrompts] = useState([]);
    const canvasRef = useRef(null);

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const sanitizeFileName = (text) => {
        return text.replace(/[^a-zA-Z0-9-_]/g, '_'); // Replace disallowed characters with an underscore
    };

    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
        text.split('\n').forEach((paragraph) => {
            const words = paragraph.split(' ');
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
            y += lineHeight; // Add an extra space between paragraphs
        });
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
        setPrompts([...prompts, { imageData, text: prompt }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        storePrompt();
        setPrompt(''); // Clear the prompt input after storing
    };

    return (
        <div className={"chatFB"}>
            <h1>Save Text as Image</h1>

            <form onSubmit={handleSubmit}>
                <TooltipIcon title="Create an image file from text and download it; then create a manifest and upload to claim. (File names begin with 'text-')." />
                <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="Enter your text"
                    rows="4"
                    cols="50"
                />
                <button tabIndex={"0"} type="submit" title={"Save Text to Image"}>Save Text as Image</button>
            </form>
            <div className={"promptLibrary"}>
                {prompts.map(({ imageData, text }, index) => (
                    <div key={index}>
                        <img src={imageData} alt={`Prompt ${index + 1}`} />
                        <a href={imageData} download={`Text-${sanitizeFileName(text.substring(0, 25))}.png`}>
                            Download Text as Image {index + 1}
                        </a>
                    </div>
                ))}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default TextToImage;
