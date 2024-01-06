// Imagebot.js
import React, { useState } from 'react';
import axios from 'axios';

const Imagebot = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Indicate that a request is in progress
        if (!prompt.trim()) return;

        const apiEndpoint = "https://filebabydalle.openai.azure.com/openai/images/generations:submit?api-version=2023-06-01-preview";

        const headers = {
            'api-key': process.env.REACT_APP_OPENAI_API_KEY,
            'Content-Type': 'application/json'
        };

        const data = {
            prompt: prompt,
            size: "1024x1024", // Size of the image to generate
            n: 1, // Number of images to generate
        };

        try {
            // Make the POST request to the DALL·E API
            const response = await axios.post(apiEndpoint, data, { headers: headers });
            const operationLocation = response.headers['operation-location'];

            // Function to poll the operation location for the result
            const pollForImage = async (operationLocation) => {
                try {
                    const statusResponse = await axios.get(operationLocation, { headers: headers });
                    console.log('Polling response data:', statusResponse.data); // Log the response data

                    // Check if the status is 'succeeded' and if the URL is present
                    if (statusResponse.status === 200 && statusResponse.data.status === 'succeeded' && statusResponse.data.result.data[0].url) {
                        setImageUrl(statusResponse.data.result.data[0].url); // Set the image URL
                        setIsLoading(false); // Set loading state to false
                    } else {
                        console.log('Image not ready, retrying...');
                        // If the image is not ready, poll again after a delay
                        setTimeout(() => pollForImage(operationLocation), 1000); // Retry every second
                    }
                } catch (pollError) {
                    console.error('Error polling for image:', pollError);
                    setIsLoading(false); // Set loading state to false
                }
            };

            pollForImage(operationLocation); // Start polling
            setPrompt(''); // Clear the input after sending
        } catch (error) {
            console.error('Error with DALL·E API:', error);
            setIsLoading(false); // Set loading state to false
        }
    };

    return (
        <div>
            <h1>Image Generator</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={prompt}
                    onChange={handleInputChange}
                    placeholder="Describe the image you want to generate"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </form>
            {imageUrl && (
                <div>
                    <h2>Generated Image:</h2>
                    <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                </div>
            )}
            {isLoading && <p>Generating your image, please wait...</p>}
        </div>
    );
};

export default Imagebot;
