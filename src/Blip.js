import React, { useState } from 'react';
import axios from 'axios';

const Blip = ({ setFilterCriteria }) => {
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;
        const targetUrl = "https://z-uootw.westus.inference.ml.azure.com/score"
        const apiEndpoint = targetUrl;

        const headers = {
            'Authorization': `Bearer ${process.env.REACT_APP_BLIP_API_KEY}`,
            'Content-Type': 'application/json'
        };

        // Convert image file to base64
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1]; // Remove the 'data:image/*;base64,' prefix

            const requestBody = {
                input_data: {
                    columns: ["image", "text"],
                    index: [],
                    data: [[base64Image, text]]
                },
                params: {}
            };

            try {
                const apiResponse = await axios.post(apiEndpoint, JSON.stringify(requestBody), { headers });
                setResponse(apiResponse.data);
            } catch (error) {
                console.error('Error with Blip API:', error);
            }
        };
        reader.onerror = error => {
            console.error('Error reading image file:', error);
        };

        // Clear the inputs
        setImage(null);
        setText('');
    };

    return (
        <div className="blip">
            <h1>Upload Image and Enter Text for Blip</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                />
                <input
                    type="text"
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Enter any relevant text here"
                />
                <button type="submit">Submit</button>
            </form>
            {response && (
                <div className="response">
                    <strong>Response:</strong> {response}
                </div>
            )}
        </div>
    );
};

export default Blip;
