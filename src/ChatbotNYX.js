import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import './ChatbotNYX.css';
import chatConfig from './ChatSetup-NYX.json';
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const searchServiceName = "nyxsearch724482774264";
const indexName = "nyx-index";
const searchApiKey = process.env.REACT_APP_AZURE_SEARCH_API_KEY;
const searchEndpoint = `https://${searchServiceName}.search.windows.net`;

const searchClient = new SearchClient(searchEndpoint, indexName, new AzureKeyCredential(searchApiKey));

const ChatbotNYX = ({ userName, setPageContent, pageContent, selectedFileUrls, includeFilesInChat, setIncludeFilesInChat }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);
    const [error, setError] = useState('');
    const responseEndRef = useRef(null);

    const containerUrl = 'https://claimed.at.file.baby/filebabyblob';
    const sasToken = process.env.REACT_APP_SAS_TOKEN;

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
                { role: "assistant", content: `${searchResults}\nImage URL: ${imageUrl}\n${selectedFileUrls.join(' ')}` }  // Include search results, image URL, and file URLs as context
            ],
            max_tokens: chatConfig.chatParameters.maxResponseLength,
            temperature: chatConfig.chatParameters.temperature,
            top_p: chatConfig.chatParameters.top_p,
            frequency_penalty: chatConfig.chatParameters.frequencyPenalty,
            presence_penalty: chatConfig.chatParameters.presencePenalty,
        };

        try {
            const apiResponse = await axios.post(apiEndpoint, data, { headers });
            const gptResponse = apiResponse.data.choices[0].message.content;

            // Check if the response is HTML content
            if (gptResponse.startsWith("<!DOCTYPE html>") || gptResponse.startsWith("<html>")) {
                setPageContent(gptResponse);
            } else {
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
        setPageContent(''); // Clear the generated page content
    };

    const handleCopyChat = () => {
        const chatContent = response.map(exchange => `You: ${exchange.question}\nNYX: ${exchange.answer}`).join('\n\n');
        navigator.clipboard.writeText(chatContent).then(() => {
            alert('Chat copied to clipboard');
        });
    };

    const handleThumbnailGeneration = async (uniqueFileName) => {
        try {
            const pageContentElement = document.querySelector("#pageContent");
            if (!pageContentElement) {
                throw new Error('Page content element not found');
            }

            console.log("Capturing screenshot of the page content...");

            const canvas = await html2canvas(pageContentElement);
            const thumbnailBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            if (!thumbnailBlob) {
                throw new Error('Failed to create thumbnail blob');
            }

            const uniqueThumbnailName = uniqueFileName.replace('.html', '-thumbnail.png');
            const thumbnailPath = `${containerUrl}/${userName}/thumbnails/${uniqueThumbnailName}?${sasToken}`;

            console.log("Thumbnail path:", thumbnailPath);

            const thumbnailResponse = await fetch(thumbnailPath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'image/png',
                },
                body: thumbnailBlob,
            });

            if (!thumbnailResponse.ok) {
                throw new Error(`Failed to save thumbnail to File Baby with status: ${thumbnailResponse.status}`);
            }

            console.log("Thumbnail saved successfully:", thumbnailPath);
            return thumbnailPath;
        } catch (error) {
            console.error('Error generating and saving thumbnail:', error);
            setError(`Error generating and saving thumbnail: ${error.message}`);
            return null;
        }
    };

    const savePageContent = async () => {
        try {
            const htmlContent = pageContent;
            if (!htmlContent) {
                throw new Error('No page content to save');
            }

            const uniqueFileName = `${new Date().getTime()}-generated-page.html`;
            const filePath = `${containerUrl}/${userName}/${uniqueFileName}?${sasToken}`;
            const blob = new Blob([htmlContent], { type: 'text/html' });

            console.log("Saving HTML file:", filePath);

            const saveResponse = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'text/html',
                },
                body: blob,
            });

            if (!saveResponse.ok) {
                throw new Error(`Failed to save to File Baby with status: ${saveResponse.status}`);
            }

            console.log("HTML file saved successfully:", filePath);

            const thumbnailPath = await handleThumbnailGeneration(uniqueFileName);

            if (!thumbnailPath) {
                throw new Error('Thumbnail generation failed');
            }

            setSavedToFileBaby(true);
            setTimeout(() => setSavedToFileBaby(false), 3000); // Reset after 3 seconds

            console.log("File and thumbnail saved successfully:", filePath, thumbnailPath);
        } catch (error) {
            console.error('Error saving to File Baby:', error);
            setError(`Error saving to File Baby: ${error.message}`);
        }
    };

    useEffect(() => {
        responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [response]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleThumbnailClick = (url) => {
        setPrompt(prevPrompt => prevPrompt ? `${prevPrompt} ${url}` : url);
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
                <div className="chat-popup">
                    <div className="chat-title-bar nyx">ASK NYX TO CREATE A PAGE</div>
                    <div className={`loading-overlay ${isLoading ? 'visible' : ''}`}>
                        <div className="loading-indicator">Generating Response _</div>
                    </div>

                    <div className="selected-files">
                        <h3>Click images to include in the prompt:</h3>
                        <div className="file-thumbnails">
                            {selectedFileUrls.map((url, index) => (
                                <img
                                    src={url}
                                    alt={`Selected File ${index + 1}`}
                                    className="thumbnail"
                                    onClick={() => handleThumbnailClick(url)}
                                    key={index}
                                />
                            ))}
                        </div>
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
                            <button type="button" onClick={savePageContent} title="Save to File Baby">Save to File Baby</button>
                        </div>
                    </form>
                    {isLoading && <p>Saving...</p>}
                    {error && <p className="error">{error}</p>}
                    {savedToFileBaby && <p>Web page saved to File Baby successfully!</p>}
                </div>
            )}
        </div>
    );
};

export default ChatbotNYX;
