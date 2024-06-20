import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotNYX from './ChatbotNYX';
import nyxImage from './img/Nyx Goddess of Night1.png';
import './UseWithNyxPage.css';

const UseWithNyxPage = () => {
    const location = useLocation();
    const selectedFileUrls = location.state?.selectedFileUrls || [];
    const [includeFilesInChat, setIncludeFilesInChat] = useState(true);
    const [pageContent, setPageContent] = useState('');

    const handleCheckboxChange = () => {
        setIncludeFilesInChat(!includeFilesInChat);
    };

    return (
        <div className="nyx-page">
            <img src={nyxImage} alt="NYX" className="nyx-image" />
            <div className="nyx-content">
                <h2>Use with NYX</h2>
                <div className="selected-files">
                    <h3>Selected Files:</h3>
                    <ul>
                        {selectedFileUrls.map((url, index) => (
                            <li key={index}>
                                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                            </li>
                        ))}
                    </ul>
                    <label>
                        <input
                            type="checkbox"
                            checked={includeFilesInChat}
                            onChange={handleCheckboxChange}
                        />
                        Include files in chat
                    </label>
                </div>
                <ChatbotNYX setPageContent={setPageContent} selectedFileUrls={selectedFileUrls} includeFilesInChat={includeFilesInChat} />
                <div dangerouslySetInnerHTML={{ __html: pageContent }} />
            </div>
        </div>
    );
};

export default UseWithNyxPage;
