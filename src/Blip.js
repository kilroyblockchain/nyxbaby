import React, { useState } from 'react';
import axios from 'axios';

const Blip = ({ setFilterCriteria }) => {
    const [image, setImage] = useState(null);
    const [response, setResponse] = useState('');

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;

        const apiEndpoint = "https://z-uootw.westus.inference.ml.azure.com/score";

        const headers = {
            'Authorization': `Bearer ${process.env.REACT_APP_BLIP_API_KEY}`,
            'Content-Type': 'application/json',
            'azureml-model-deployment': 'salesforce-blip-2-opt-2-7b-vq-3' // Include this header only if required
        };

        // Convert image file to base64
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = async () => {
            const base64Image = reader.result;

            const requestBody = {
                input_data: {
                    columns: ["image", "text"],
                    index: [],
                    data: [[base64Image, ""]] // Assuming the endpoint expects the image and an optional text field
                },
                params: {}
            };

            try {
                const apiResponse = await axios.post(apiEndpoint, requestBody, { headers });
                setResponse(apiResponse.data);
                // Adjust according to the actual response structure
            } catch (error) {
                console.error('Error with Blip API:', error);
            }
        };
        reader.onerror = () => {
            console.error('Error converting image to base64.');
        };

        setImage(null); // Clear the file input
    };

    return (
        <div className={"blip"}>
            <h1>Upload Image to Blip</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <button type="submit">Upload</button>
            </form>
            {response && (
                <div className={"response"}>
                    <strong>Response:</strong> {response}
                </div>
            )}
        </div>
    );
};

export default Blip;
