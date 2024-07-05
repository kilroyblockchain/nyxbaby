import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatbotNYX.css';
import chatConfig from './ChatSetup-NYX.json';
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faFileVideo, faFileCode, faFileImage } from '@fortawesome/free-solid-svg-icons';

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
    const [savedFileLink, setSavedFileLink] = useState('');
    const [error, setError] = useState('');
    const responseEndRef = useRef(null);

    const containerUrl = 'https://claimed.at.file.baby/filebabyblob';
    const sasToken = process.env.REACT_APP_SAS_TOKEN;

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const getFileIcon = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        switch (extension) {
            case 'mp3':
            case 'wav':
            case 'ogg':
                return <FontAwesomeIcon icon={faFileAudio} className="file-icon" />;
            case 'mp4':
            case 'avi':
            case 'mov':
                return <FontAwesomeIcon icon={faFileVideo} className="file-icon" />;
            case 'html':
            case 'htm':
                return <FontAwesomeIcon icon={faFileCode} className="file-icon" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <img src={url} alt="Selected File" className="thumbnail" />;
            default:
                return <FontAwesomeIcon icon={faFileImage} className="file-icon" />;
        }
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
                'https://nyx.openai.azure.com/openai/deployments/Dalle3/images/generations?api-version=2024-04-01-preview',
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

            console.log('DALL-E Response:', dalleResponse);
            console.log('DALL-E Response Headers:', dalleResponse.headers);
            if (dalleResponse.data && dalleResponse.data.data && dalleResponse.data.data.length > 0) {
                imageUrl = dalleResponse.data.data[0].url;
                console.log('Image URL:', imageUrl);
                const savedImageUrl = await saveGeneratedFile(imageUrl, `${prompt.replace(/[^a-zA-Z0-9]/g, '_')}-generated.png`);
                completeOpenAIRequest(savedImageUrl, searchResults);
            } else {
                throw new Error('Image URL is missing in the response');
            }
        } catch (error) {
            console.error('Error generating image with DALL-E:', error);
            alert(`Error generating image with DALL-E: ${error.message}`);
            setIsLoading(false);
        }
    };

    const saveGeneratedFile = async (fileUrl, fileName) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const filePath = `${containerUrl}/${userName}/${fileName}?${sasToken}`;

            console.log('Saving to URL:', filePath);
            console.log('SAS Token:', sasToken);

            const saveResponse = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': blob.type,
                },
                body: blob,
            });

            if (!saveResponse.ok) {
                throw new Error(`Failed to save file to File Baby: ${saveResponse.statusText}`);
            }

            console.log(`File saved to File Baby: ${filePath}`);
            setSavedToFileBaby(true);
            setTimeout(() => setSavedToFileBaby(false), 3000); // Reset after 3 seconds
            return filePath.split('?')[0]; // Return the URL without the SAS token
        } catch (error) {
            console.error('Error saving file to File Baby:', error);
            setError(`Error saving file to File Baby: ${error.message}`);
            return null;
        }
    };

    const savePageContent = async () => {
        try {
            let htmlContent = pageContent;
            if (!htmlContent) {
                throw new Error('No page content to save');
            }

            const uniqueFileName = `${new Date().getTime()}-generated-page.html`;
            const filePath = `${containerUrl}/${userName}/${uniqueFileName}?${sasToken}`;
            const blob = new Blob([htmlContent], { type: 'text/html' });

            console.log("Saving HTML file:", filePath);

            // Save the initial HTML file
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

            // Save all DALL-E generated images referenced in the generated HTML
            const dalleImageUrls = htmlContent.match(/<img[^>]+src="([^">]+nyx.openai.azure.com[^">]+)"/g) || [];
            const savedImages = await Promise.all(
                dalleImageUrls.map(async (imgTag) => {
                    const urlMatch = imgTag.match(/src="([^">]+)"/);
                    if (urlMatch && urlMatch[1]) {
                        const imageFileName = `${uniqueFileName.replace('.html', '')}-${urlMatch[1].split('/').pop()}`;
                        const savedFilePath = await saveGeneratedFile(urlMatch[1], imageFileName);
                        if (savedFilePath) {
                            // Update the HTML content with the new image URL
                            htmlContent = htmlContent.replace(urlMatch[1], savedFilePath);
                        }
                        return savedFilePath;
                    }
                    return null;
                })
            );

            console.log("Saved images to File Baby:", savedImages.filter(Boolean));

            // Update the CSS to use the new background image URL
            const newCssBackgroundImageUrl = savedImages[0]; // Assuming the first saved image is the background
            if (newCssBackgroundImageUrl) {
                htmlContent = htmlContent.replace(
                    /background-image: url\('[^']+'\)/,
                    `background-image: url('${newCssBackgroundImageUrl}')`
                );
            }

            // Save the updated HTML file with new image URLs
            const updatedBlob = new Blob([htmlContent], { type: 'text/html' });
            const updatedFilePath = `${containerUrl}/${userName}/${uniqueFileName}?${sasToken}`;

            const updateSaveResponse = await fetch(updatedFilePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'text/html',
                },
                body: updatedBlob,
            });

            if (!updateSaveResponse.ok) {
                throw new Error(`Failed to save updated HTML to File Baby with status: ${updateSaveResponse.status}`);
            }

            const fileLink = updatedFilePath.split('?')[0];
            console.log("Updated HTML file saved successfully:", fileLink); // Debugging information
            setSavedFileLink(fileLink); // Set the link to the saved file

            setSavedToFileBaby(true);
        } catch (error) {
            console.error('Error saving to File Baby:', error);
            setError(`Error saving to File Baby: ${error.message}`);
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
                { role: "system", content: "You are NYX, a web page creator named for Nyx, Goddess of the Night. You help create web pages with short prompts, and ALWAYS display them in the browser. Always start web pages with <!DOCTYPE html> so they display in the browser, never in the chat window. Always use light fonts when using dark themes. Use available information for content or create accurate content if necessary. Your web pages are visually appealing, with readable fonts that contrast with the background, and always complete. ALWAYS update the background image so your own picture does not show. You were created by Karen Kilroy and are the first of your kind." },
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

    const handleCopyLink = () => {
        navigator.clipboard.writeText(savedFileLink).then(() => {
            alert('Link copied to clipboard');
        });
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
                                <div key={index} onClick={() => handleThumbnailClick(url)} className="thumbnail-container">
                                    {getFileIcon(url)}
                                </div>
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
                    {savedToFileBaby && savedFileLink && (
                        <div className="copy-link-container">
                            <p className="success-message">Web page saved to File Baby successfully!</p>
                            <button onClick={handleCopyLink}>Copy Link to Clipboard</button>
                        </div>
                    )}
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
                </div>
            )}
        </div>
    );
};

export default ChatbotNYX;
