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

const searchClient = searchApiKey ? new SearchClient(searchEndpoint, indexName, new AzureKeyCredential(searchApiKey)) : null;

const ChatbotNYX = ({ userName, setPageContent, pageContent, selectedFileUrls, includeFilesInChat, setIncludeFilesInChat }) => {
    const [prompt, setPrompt] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);
    const [savedFileLink, setSavedFileLink] = useState('');
    const [error, setError] = useState('');
    const [completionMessage, setCompletionMessage] = useState('');
    const [flashSaveButton, setFlashSaveButton] = useState(false); // New state for flashing save button
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

    const retryRequest = async (requestFn, retries = 3, delay = 1000) => {
        let attempt = 0;
        while (attempt < retries) {
            try {
                return await requestFn();
            } catch (error) {
                attempt++;
                if (attempt >= retries) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    const rewordPrompt = async (originalPrompt) => {
        const rewordEndpoint = "https://nyx.openai.azure.com/openai/deployments/nyx/chat/completions?api-version=2024-05-01-preview";
        const headers = {
            'api-key': process.env.REACT_APP_OPENAI_API_KEY,
            'Content-Type': 'application/json'
        };
        const data = {
            model: "nyx",
            messages: [
                { role: "system", content: "You are an assistant that helps reword prompts to be more effective." },
                { role: "user", content: `Please reword this prompt to make it more effective: ${originalPrompt}` }
            ],
            max_tokens: 50,
            temperature: 0.7,
        };
        try {
            const response = await axios.post(rewordEndpoint, data, { headers });
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error rewording prompt:', error);
            return originalPrompt;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);

        let searchResults = '';
        try {
            if (!searchClient) {
                throw new Error('Search client is not initialized.');
            }
            const searchRequest = async () => {
                const searchResponse = await searchClient.search(prompt, { top: 5 });
                let results = '';
                for await (const result of searchResponse.results) {
                    results += result.document.content + ' ';
                }
                return results;
            };
            searchResults = await retryRequest(searchRequest);
        } catch (error) {
            console.error('Error querying Azure Search:', error);
            alert(`Error querying Azure Search: ${error.message}`);
            setIsLoading(false);
            return;
        }

        let imageUrl = '';
        try {
            const dalleRequest = async () => {
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

                if (dalleResponse.data && dalleResponse.data.data && dalleResponse.data.data.length > 0) {
                    return dalleResponse.data.data[0].url;
                } else {
                    throw new Error('Image URL is missing in the response');
                }
            };
            imageUrl = await retryRequest(dalleRequest);
            const savedImageUrl = await saveGeneratedFile(imageUrl, `${prompt.replace(/[^a-zA-Z0-9]/g, '_')}-generated.png`);
            completeOpenAIRequest(savedImageUrl, searchResults);
        } catch (error) {
            console.error('Error generating image with DALL-E:', error);

            if (error.response && error.response.status === 400) {
                console.log('DALLE Error 400: Rewording prompt and retrying');
                const newPrompt = await rewordPrompt(prompt);
                try {
                    const dalleResponse = await axios.post(
                        'https://nyx.openai.azure.com/openai/deployments/Dalle3/images/generations?api-version=2024-04-01-preview',
                        {
                            prompt: newPrompt,
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

                    if (dalleResponse.data && dalleResponse.data.data && dalleResponse.data.data.length > 0) {
                        imageUrl = dalleResponse.data.data[0].url;
                        const savedImageUrl = await saveGeneratedFile(imageUrl, `${newPrompt.replace(/[^a-zA-Z0-9]/g, '_')}-generated.png`);
                        completeOpenAIRequest(savedImageUrl, searchResults);
                    } else {
                        throw new Error('Image URL is missing in the response');
                    }
                } catch (retryError) {
                    console.error('Error retrying with reworded prompt:', retryError);
                    completeOpenAIRequest('', searchResults);
                }
            } else {
                completeOpenAIRequest('', searchResults);
            }
        }
    };

    const saveGeneratedFile = async (fileUrl, fileName) => {
        try {
            if (!fileUrl || !sasToken) {
                throw new Error('File URL or SAS Token is missing.');
            }
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const filePath = `${containerUrl}/${userName}/${fileName}?${sasToken}`;

            const saveResponse = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': blob.type,
                },
                body: blob,
            });

            if (!saveResponse.ok) {
                throw new Error(`Failed to save to File Baby with status: ${saveResponse.statusText}`);
            }

            setSavedToFileBaby(true);
            setTimeout(() => setSavedToFileBaby(false), 3000);
            return filePath.split('?')[0];
        } catch (error) {
            console.error('Error Saving to File Baby:', error);
            setError(`Please reword your prompt and try again: ${error.message}`);
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

            const dalleImageUrls = htmlContent.match(/<img[^>]+src="([^">]+nyx.openai.azure.com[^">]+)"/g) || [];
            const savedImages = await Promise.all(
                dalleImageUrls.map(async (imgTag) => {
                    const urlMatch = imgTag.match(/src="([^">]+)"/);
                    if (urlMatch && urlMatch[1]) {
                        const imageFileName = `${uniqueFileName.replace('.html', '')}-${urlMatch[1].split('/').pop()}`;
                        const savedFilePath = await saveGeneratedFile(urlMatch[1], imageFileName);
                        if (savedFilePath) {
                            htmlContent = htmlContent.replace(urlMatch[1], savedFilePath);
                        }
                        return savedFilePath;
                    }
                    return null;
                })
            );

            const newCssBackgroundImageUrl = savedImages[0];
            if (newCssBackgroundImageUrl) {
                htmlContent = htmlContent.replace(
                    /background-image: url\('[^']+'\)/,
                    `background-image: url('${newCssBackgroundImageUrl}')`
                );
            }

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
            setSavedFileLink(fileLink);

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
                { role: "assistant", content: `${searchResults}\nImage URL: ${imageUrl}\n${selectedFileUrls.join(' ')}` }
            ],
            max_tokens: chatConfig.chatParameters.maxResponseLength,
            temperature: chatConfig.chatParameters.temperature,
            top_p: chatConfig.chatParameters.top_p,
            frequency_penalty: chatConfig.chatParameters.frequencyPenalty,
            presence_penalty: chatConfig.chatParameters.presencePenalty,
        };

        try {
            const apiResponse = await axios.post(apiEndpoint, data, { headers });
            let gptResponse = apiResponse.data.choices[0].message.content;

            if (imageUrl && !gptResponse.includes("background-image: url")) {
                gptResponse = gptResponse.replace(
                    /<head>/,
                    `<head>\n<style>\nbody { background-image: url('${imageUrl}'); background-size: cover; }\n</style>`
                );
            }

            if (gptResponse.startsWith("<!DOCTYPE html>") || gptResponse.startsWith("<html>")) {
                setPageContent(gptResponse);
                setCompletionMessage("Your creation is complete. Click Save to File Baby then Copy to Clipboard or view it in a new browser window.");
                setFlashSaveButton(true); // Flash the save button
                setTimeout(() => setFlashSaveButton(false), 3000); // Stop flashing after 3 seconds
            } else {
                setCompletionMessage("Could not complete your request. Try again.");
            }
        } catch (error) {
            console.error('Error with OpenAI Chat:', error.response ? error.response.data : error.message);
            alert(`Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
            setCompletionMessage("Could not complete your request. Try again.");
        }

        setIsLoading(false);
        setPrompt('');
    };

    const handleClearChat = () => {
        setPrompt('');
        setPageContent('');
        setCompletionMessage('');
    };

    const handleCopyChat = () => {
        const chatContent = `Prompt: ${prompt}\nPage Content:\n${pageContent}`;
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
    }, []);

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
                {isOpen ? 'Hide NYX' : 'Create a web page with NYX NoCode'}
            </button>
            {isOpen && (
                <div className="chat-popup">
                    <div className="chat-title-bar nyx">ASK NYX NOCODE TO CREATE A PAGE</div>
                    <div className={`loading-overlay ${isLoading ? 'visible' : ''}`}>
                        <div className="loading-indicator">Generating Response _</div>
                    </div>

                    <div className="selected-files">
                        <h3>Click icons to include content in the prompt:</h3>
                        <div className="file-thumbnails">
                            {selectedFileUrls.map((url, index) => (
                                <div key={index} onClick={() => handleThumbnailClick(url)} className="thumbnail-container">
                                    {getFileIcon(url)}
                                </div>
                            ))}
                        </div>
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
                            rows="3"
                        ></textarea>
                        <div className="button-container">
                            <button tabIndex="0" type="submit" title="Send to NYX NoCode">Send</button>
                            <button type="button" onClick={handleClearChat} title="Clear Chat">Clear</button>
                            <button type="button" onClick={handleCopyChat} title="Copy Chat">Copy</button>
                            <button type="button" onClick={savePageContent} title="Save to File Baby" className={`${!pageContent ? "disabled" : ""} ${flashSaveButton ? "flash-green" : ""}`} disabled={!pageContent}>Save to File Baby</button>
                        </div>
                    </form>
                    {isLoading && <p>NYX NoCode is working</p>}
                    {completionMessage && <p className="completion-message">{completionMessage}</p>}
                    {error && <p className="error">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default ChatbotNYX;
