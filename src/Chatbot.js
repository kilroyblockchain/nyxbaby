// Import Axios for making HTTP requests
import axios from 'axios';
import React, { useState } from 'react';

const Chatbot = () => {
    const [userInput, setUserInput] = useState('');
    const [responses, setResponses] = useState([]);

    // Function to handle input change
    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    // Function to submit the user's question to OpenAI and retrieve the response
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        // Define the message structure
        const message_text = [
            {
                "role": "user",
                "content": userInput
            }
        ];

        // OpenAI API endpoint
        const apiEndpoint = 'https://filebabygpt3.openai.azure.com/openai/deployments/FBChat35turbo/chat/completions?api-version=2023-03-15-preview';

        try {
            const response = await axios.post(apiEndpoint, {
                messages: message_text,
                temperature: 0.7,
                max_tokens: 800,
                top_p: 0.95,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: null
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Handle the response from OpenAI
            const chatResponse = response.data.choices[0].message.content;
            setResponses([...responses, { question: userInput, answer: chatResponse }]);
            setUserInput(''); // Clear input after sending
        } catch (error) {
            console.error('Error with OpenAI Chat:', error);
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
