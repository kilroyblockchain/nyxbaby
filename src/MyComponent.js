import React, { useState } from 'react';
import GeneratedPage from './GeneratedPage';

const MyComponent = () => {
    const [pageContent, setPageContent] = useState('');

    console.log("MyComponent: setPageContent type is", typeof setPageContent);

    return (
        <div style={{ backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh' }}>
            <GeneratedPage setPageContent={setPageContent} />
            <div>{pageContent}</div>
        </div>
    );
};

export default MyComponent;
