import React, { useState } from 'react';
import axios from 'axios';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);


const Imagebot = ({ userName }) => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!prompt.trim()) {
            setError('Prompt cannot be empty.');
            setIsLoading(false);
            return;
        }

        const apiEndpoint = "https://filebabydalle.openai.azure.com/openai/images/generations:submit?api-version=2023-06-01-preview";
        const headers = {
            'api-key': process.env.REACT_APP_DALLE_OPENAI_API_KEY_2,
            'Content-Type': 'application/json'
        };
        const data = {
            prompt: prompt,
            size: "1024x1024",
            n: 1,
        };

        try {
            const response = await axios.post(apiEndpoint, data, { headers: headers });
            const operationLocation = response.headers['operation-location'];
            const pollForImage = async (operationLocation) => {
                try {
                    const statusResponse = await axios.get(operationLocation, { headers: headers });
                    if (statusResponse.status === 200 && statusResponse.data.status === 'succeeded' && statusResponse.data.result.data[0].url) {
                        setImageUrl(statusResponse.data.result.data[0].url);
                        setIsLoading(false);
                    } else {
                        setTimeout(() => pollForImage(operationLocation), 1000);
                    }
                } catch (pollError) {
                    console.error('Error polling for image:', pollError);
                    setIsLoading(false);
                }
            };

            pollForImage(operationLocation);
        } catch (error) {
            console.error('Error with DALL·E API:', error);
            setIsLoading(false);
        }
    };

    const handleSaveToFileBaby = async () => {
        if (!userName) {
            setError('User name is not defined. Cannot save to specific folder.');
            return;
        }

        setIsLoading(true);
        setError('');

        if (!imageUrl) {
            setError('No image to save.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(imageUrl);
            const imageBlob = await response.blob();
            const mimeType = imageBlob.type;

            // Use the entire email address as the folder name
            const encodedUserName = encodeURIComponent(userName);
            const containerUrl = 'https://filebaby.blob.core.windows.net/filebabyblob';
            const sasToken = process.env.REACT_APP_SAS_TOKEN;
            const filePath = `${containerUrl}/${encodedUserName}/${prompt}-${Date.now()}.png`;

            const uploadResponse = await fetch(`${filePath}?${sasToken}`, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': mimeType,
                },
                body: new Blob([imageBlob], { type: mimeType }),
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to save to File Baby with status: ${uploadResponse.status}`);
            }

            setSavedToFileBaby(true);
            setTimeout(() => {
                setSavedToFileBaby(false);
                setImageUrl('');
            }, 3000);
        } catch (error) {
            console.error('Error saving to File Baby:', error);
            setError(`Error saving to File Baby: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={"chatFB"}>
            <h1>AI Image Generator</h1>
            <form onSubmit={handleSubmit}>
                <TooltipIcon title="Generate images from AI based on your text descriptions. Uses DALL-E 2. Generated images are signed by Microsoft Responsible AI. Chat with File Baby AI for prompt ideas." />
                <input
                    type="text"
                    value={prompt}
                    onChange={handleInputChange}
                    placeholder="Describe the image you want to generate"
                    disabled={isLoading}
                />
                <button type="submit" title="Generate Image" disabled={isLoading}>Generate</button>
            </form>
            {error && <p className="error">{error}</p>}
            {imageUrl && !savedToFileBaby && (
                <div>
                    <h2>Generated Image:</h2>

                    <img className={"generated"} src={imageUrl} alt="Generated" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                    <button tabIndex={"0"} onClick={handleSaveToFileBaby} disabled={isLoading}>
                        Save to File Baby
                    </button>
                </div>
            )}
            {isLoading && <p>Generating your image, please wait...</p>}
            {savedToFileBaby && <p>Image saved to File Baby successfully!</p>}
        </div>
    );
};

export default Imagebot;
