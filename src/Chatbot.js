import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = ({ setFilterCriteria }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState([]);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const interpretAndActOnGPTResponse = (gptResponse) => {
        const lowerCaseResponse = gptResponse.toLowerCase();

        if (lowerCaseResponse.includes("image") || lowerCaseResponse.includes("photo")) {
            setFilterCriteria({ type: 'image' });
        } else if (lowerCaseResponse.includes("audio") || lowerCaseResponse.includes("music")) {
            setFilterCriteria({ type: 'audio' });
        } else if (lowerCaseResponse.includes("document")) {
            setFilterCriteria({ type: 'document' });
        } else if (lowerCaseResponse.includes("video")) {
            setFilterCriteria({ type: 'video' });
        } else {
            setFilterCriteria({}); // Clear filter criteria
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;


        // Use the endpoint URL as shown in the Azure AI Studio sample code
        const apiEndpoint = "https://fbprompt351104.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-07-01-preview";

        const headers = {
            'api-key': process.env.REACT_APP_OPENAI_API_KEY,
            'Content-Type': 'application/json'
        };

        const data = {
            messages: [
                {
                    role: "system",
                    content: "You are File Baby, an expert in Content Authenticity and Provenance."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
        };

        try {
            const apiResponse = await axios.post(apiEndpoint, data, { headers });
            const gptResponse = apiResponse.data.choices[0].message.content;
            setResponse(prevResponses => [...prevResponses, { question: prompt, answer: gptResponse }]);
            interpretAndActOnGPTResponse(gptResponse);
        } catch (error) {
            console.error('Error with OpenAI Chat:', error);
        }

        setPrompt(''); // Clear the input field
    };

    return (
        <div className={"chatFB"}>

            <h1>Chat with File Baby</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={prompt}
                    onChange={handleInputChange}
                    placeholder="Hi! How are you?"
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
