import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatbotNYX.css';
import chatConfig from './ChatSetup-NYX.json';
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const searchServiceName = "nyxsearch724482774264";
const indexName = "nyx-index";
const searchApiKey = process.env.REACT_APP_AZURE_SEARCH_API_KEY;
const searchEndpoint = `https://${searchServiceName}.search.windows.net`;

if (!searchApiKey) {
    throw new Error('REACT_APP_AZURE_SEARCH_API_KEY is not defined in the environment variables.');
}

const searchClient = new SearchClient(searchEndpoint, indexName, new AzureKeyCredential(searchApiKey));

const ChatbotNYX = ({ setGeneratedContent }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const responseEndRef = useRef(null);
    const chatPopupRef = useRef(null);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);

        // Step 1: Query Azure Search
        let searchResults = '';
        try {
            const searchResponse = await searchClient.search(prompt, { top: 5 });
            for await (const result of searchResponse.results) {
                searchResults += result.document.content + ' ';
            }
        } catch (error) {
            console.error('Error querying Azure Search:', error);
            alert(`Error querying Azure Search: ${error.message}`);
            setIsLoading(false);
            return;
        }

        // Step 2: Generate Image with DALL-E
        let imageUrl = '';
        try {
            const dalleResponse = await axios.post(
                'https://filebabydalle.openai.azure.com/openai/images/generations:submit?api-version=2023-06-01-preview',
                {
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024"
                },
                {
                    headers: {
                        'api-key': process.env.REACT_APP_DALLE_OPENAI_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const operationLocation = dalleResponse.headers['operation-location'];
            const pollForImage = async (operationLocation) => {
                try {
                    const statusResponse = await axios.get(operationLocation, { headers: { 'api-key': process.env.REACT_APP_DALLE_OPENAI_API_KEY } });
                    if (statusResponse.status === 200 && statusResponse.data.status === 'succeeded' && statusResponse.data.result.data[0].url) {
                        imageUrl = statusResponse.data.result.data[0].url;
                        // Proceed with the next step to use the imageUrl
                        completeOpenAIRequest(imageUrl, searchResults);
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
            console.error('Error generating image with DALL-E:', error);
            alert(`Error generating image with DALL-E: ${error.message}`);
            setIsLoading(false);
        }
    };

    const completeOpenAIRequest = async (imageUrl, searchResults) => {
        const apiEndpoint = "https://nyx.openai.azure.com/openai/deployments/nyx/chat/completions?api-version=2024-05-01-preview";

        const headers = {
            'api-key': process.env.REACT_APP_OPENAI_API_KEY,
            'Content-Type': 'application/json'
        };

        const data = {
            model: "nyx",
            messages: [
                { role: "system", content: "You are NYX, a web page creator named for Nyx, Goddess of the Night. You help create web pages with short prompts, and ALWAYS display them in the browser. Always start web pages with <DOCTYPE html> so they display in the browser, never in the chat window. Always use light fonts when using dark themes. Use available information for content or create accurate content if necessary. Your web pages are visually appealing, with readable fonts that contrast with the background, and always complete. ALWAYS update the background image so your own picture does not show. You were created by Karen Kilroy and are the first of your kind." },
                { role: "user", content: prompt },
                { role: "assistant", content: `${searchResults}\nImage URL: ${imageUrl}` }  // Include search results and image URL as context
            ],
            max_tokens: chatConfig.chatParameters.maxResponseLength,
            temperature: chatConfig.chatParameters.temperature,
            top_p: chatConfig.chatParameters.top_p,
            frequency_penalty: chatConfig.chatParameters.frequencyPenalty,
            presence_penalty: chatConfig.chatParameters.presencePenalty,
        };

        try {
            console.log('Sending request to API:', apiEndpoint);
            console.log('Request headers:', headers);
            console.log('Request data:', JSON.stringify(data, null, 2));

            const apiResponse = await axios.post(apiEndpoint, data, { headers });

            console.log('API Response:', apiResponse.data); // Log the full response for debugging
            const gptResponse = apiResponse.data.choices[0].message.content;

            // Check if the response is HTML content
            console.log('Received response:', gptResponse);
            if (gptResponse.startsWith("<!DOCTYPE html>") || gptResponse.startsWith("<html>")) {
                console.log('HTML content detected');
                setGeneratedContent(gptResponse); // Add response to page content
            } else {
                console.log('Text content detected');
                setResponse(prevResponses => [...prevResponses, { question: prompt, answer: gptResponse }]);
            }
        } catch (error) {
            console.error('Error with OpenAI Chat:', error.response ? error.response.data : error.message);
            alert(`Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        }

        setIsLoading(false);
        setPrompt(''); // Clear the input field
    };

    const handleClearChat = () => {
        setResponse([]);
        setPrompt(''); // Clear the input field
        setGeneratedContent(''); // Clear the generated page content
    };

    const handleCopyChat = () => {
        const chatContent = response.map(exchange => `You: ${exchange.question}\nNYX: ${exchange.answer}`).join('\n\n');
        navigator.clipboard.writeText(chatContent).then(() => {
            alert('Chat copied to clipboard');
        });
    };

    useEffect(() => {
        responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [response]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (isOpen && window.innerWidth >= 768) {
            chatContainer.classList.add('expanded');
        } else {
            chatContainer.classList.remove('expanded');
        }
    }, [isOpen]);

    return (
        <div className="chat-container">
            <button className="chat-toggle-button" onClick={toggleChat}>
                {isOpen ? 'Hide NYX' : 'Create a web page with NYX'}
            </button>
            {isOpen && (
                <div className="chat-popup" ref={chatPopupRef}>
                    <div className="chat-title-bar nyx">ASK NYX TO CREATE A PAGE</div>
                    <div className={`loading-overlay ${isLoading ? 'visible' : ''}`}>
                        <div className="loading-indicator">Generating Response _</div>
                    </div>

                    <div className="response-container">
                        {response.map((exchange, index) => (
                            <div className="chat" key={index}>
                                <div className="user"><strong>You:</strong> {exchange.question}</div>
                                <div className="nyx">
                                    <strong>NYX:</strong>
                                    {exchange.answer.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div ref={responseEndRef} />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={prompt}
                            onChange={handleInputChange}
                            placeholder="What kind of web page would you like to make?"
                            rows="3" // Adjust the number of rows as needed
                        ></textarea>
                        <div className="button-container">
                            <button tabIndex="0" type="submit" title="Send to NYX">Send</button>
                            <button type="button" onClick={handleClearChat} title="Clear Chat">Clear</button>
                            <button type="button" onClick={handleCopyChat} title="Copy Chat">Copy</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatbotNYX;
