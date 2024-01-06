// Chatbot.js
import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState([]);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        // Use the endpoint URL as shown in the Azure AI Studio sample code
    //    const apiEndpoint = "https://filebabygpt3.openai.azure.com/openai/deployments/FBChat35turbo/chat/completions?api-version=2023-07-01-preview";
        const apiEndpoint = "https://fbprompt351104.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15-preview";
        //const apiEndpoint="https://filebabydalle.openai.azure.com/openai/images/generations:submit?api-version=2023-06-01-preview";
        // Use the header format as shown in the sample code
        const headers = {
            'api-key': process.env.REACT_APP_OPENAI_API_KEY,
            'Content-Type': 'application/json'
        };

        // Set the request data according to the sample code structure
        const data = {
            messages: [
                {
                    role: "system",
                    content: "You are File Baby, an expert in C2PA.org, Content Authenticity Initiative, and my.file.baby. You are cheerful and helpful and don't frequently mention being an AI."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            // Additional parameters like temperature, max_tokens, etc. can be added here
        };

        try {
            // Make the POST request to the OpenAI API
            const response = await axios.post(apiEndpoint, data, { headers: headers });
            // Update the state with the response data
            // Make sure to adjust the path to the message content according to the actual API response structure
            setResponse(prevResponses => [...prevResponses, { question: prompt, answer: response.data.choices[0].message.content }]);
            setPrompt(''); // Clear the input after sending
        } catch (error) {
            console.error('Error with OpenAI Chat:', error);
            // Handle errors here, such as updating the UI to notify the user
        }
    };

    return (
        <div>
            <h1>Prompt</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={prompt}
                    onChange={handleInputChange}
                    placeholder="Type your message"
                />
                <button type="submit">Send</button>
            </form>
            <div>
                {response.map((exchange, index) => (
                    <div className={"chat"} key={index}>
                        <div className={"user"}><strong>You:</strong> {exchange.question}
                            <br /></div>
                        <div className={"filebaby"}><strong>File Baby:</strong> {exchange.answer}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chatbot;
