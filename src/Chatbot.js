import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = ({ setFilterCriteria }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState([]);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const interpretAndActOnGPTResponse = (gptResponse) => {
        if (gptResponse.toLowerCase().includes("hello world")) {
            setFilterCriteria({ action: 'showHelloWorld' });
        } else {
            setFilterCriteria({});
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const apiEndpoint = "https://karen-ai4-aiservices591054455.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2023-07-01-preview";
        const headers = {
            'api-key': process.env.REACT_APP_OPENAI_API_KEY,
            'Content-Type': 'application/json'
        };

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
        };

        try {
            const response = await axios.post(apiEndpoint, data, { headers: headers });
            const gptResponse = response.data.choices[0].message.content;
            setResponse(prevResponses => [...prevResponses, { question: prompt, answer: gptResponse }]);
            interpretAndActOnGPTResponse(gptResponse);
            setPrompt('');
        } catch (error) {
            console.error('Error with OpenAI Chat:', error);
        }
    };

    return (
        <div>
            <h1>Chatbot GPT4</h1>
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
                    <div key={index}>
                        <strong>You:</strong> {exchange.question}
                        <br />
                        <strong>File Baby:</strong> {exchange.answer}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chatbot;
