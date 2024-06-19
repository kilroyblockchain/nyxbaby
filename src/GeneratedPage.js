import React from 'react';

const GeneratedPage = ({ content }) => {
    return (
        <div className="generated-page">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default GeneratedPage;
