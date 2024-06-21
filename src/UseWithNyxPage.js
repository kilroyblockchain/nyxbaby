import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotNYX from './ChatbotNYX';
import './UseWithNyxPage.css';

const UseWithNyxPage = ({ userName }) => {
    const location = useLocation();
    const selectedFileUrls = location.state?.selectedFileUrls || [];
    const [includeFilesInChat, setIncludeFilesInChat] = useState(true);
    const [pageContent, setPageContent] = useState('');

    console.log("UseWithNyxPage userName:", userName);  // Debugging line

    return (
        <div id="pageContent">
            <ChatbotNYX
                userName={userName}
                setPageContent={setPageContent}
                pageContent={pageContent}
                selectedFileUrls={selectedFileUrls}
                includeFilesInChat={includeFilesInChat}
                setIncludeFilesInChat={setIncludeFilesInChat}
            />
            <div dangerouslySetInnerHTML={{ __html: pageContent }} />
        </div>
    );
};

export default UseWithNyxPage;
