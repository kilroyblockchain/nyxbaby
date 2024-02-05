import React, { useState } from 'react';
import axios from 'axios';

const Whisper = () => {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!text.trim()) {
            setError('Text cannot be empty.');
            setIsLoading(false);
            return;
        }

        const apiEndpoint = "https://project-fbprompt351104-ktits.westus.inference.ml.azure.com/score";
        const headers = {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_WHISPER_API_KEY}`,
            'Content-Type': 'application/json'
        };
        const requestBody = {
            input_data: {}, // Update this part based on how the text-to-speech API expects the text
            params: {}
        };

        try {
            const response = await axios.post(apiEndpoint, requestBody, { headers });
            // Assuming the API returns a direct URL to the generated speech audio
            setAudioUrl(response.data);
            setIsLoading(false);
        } catch (apiError) {
            console.error('Error with Text-to-Speech API:', apiError);
            setError('Failed to generate speech from text.');
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Speech to Text Converter</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={text}
                    onChange={handleInputChange}
                    placeholder="Enter text to convert to speech"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>Convert</button>
            </form>
            {error && <p className="error">{error}</p>}
            {audioUrl && (
                <div>
                    <h2>Generated Speech:</h2>
                    <audio controls>
                        <source src={audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
            {isLoading && <p>Converting your text to speech, please wait...</p>}
        </div>
    );
};

export default Whisper;
