import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotNYX from './ChatbotNYX';
import './UseWithNyxPage.css';

const UseWithNyxPage = () => {
    const location = useLocation();
    const selectedFileUrls = location.state?.selectedFileUrls || [];
    const [includeFilesInChat, setIncludeFilesInChat] = useState(true);
    const [pageContent, setPageContent] = useState('');

    return (
        <div className="nyx-page">
            <ChatbotNYX
                setPageContent={setPageContent}
                selectedFileUrls={selectedFileUrls}
                includeFilesInChat={includeFilesInChat}
                setIncludeFilesInChat={setIncludeFilesInChat}
            />
            <div className="content-container" dangerouslySetInnerHTML={{ __html: pageContent }} />
        </div>
    );
};

export default UseWithNyxPage;
