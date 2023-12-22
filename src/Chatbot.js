// Chatbot.js
import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [userInput, setUserInput] = useState('');
    const [responses, setResponses] = useState([]);

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const openAIEndpoint = "https://filebaby3537084458.openai.azure.com/";

        // Define the headers
        const headers = {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };

        // Log the headers to the console
        console.log("Headers being sent: ", headers);

        try {
            const response = await axios.post(
                openAIEndpoint,
                { prompt: userInput, max_tokens: 150 },
                { headers: headers }
            );

            const chatResponse = response.data.choices[0].text;
            setResponses([...responses, { question: userInput, answer: chatResponse }]);
            setUserInput(''); // Clear input after sending
        } catch (error) {
            console.error('Error with OpenAI Chat:', error);
            // Add any error handling logic here
        }
    };

    return (
        <div>
            <h1>File Baby Chatbot</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Ask me anything..."
                />
                <button type="submit">Send</button>
            </form>
            <div>
                {responses.map((exchange, index) => (
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
