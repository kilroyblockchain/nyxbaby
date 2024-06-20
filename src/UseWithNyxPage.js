import React, { useState } from 'react';
import ChatbotNYX from './ChatbotNYX';

const UseWithNyxPage = () => {
    const [generatedContent, setGeneratedContent] = useState('');

    return (
        <div style={{ backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh' }}>
            <ChatbotNYX setGeneratedContent={setGeneratedContent} />
            {generatedContent && (
                <div className="generated-content" dangerouslySetInnerHTML={{ __html: generatedContent }} />
            )}
        </div>
    );
};

export default UseWithNyxPage;
