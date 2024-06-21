import React, { useState } from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);

const ChatboxWithSaveButton = ({ userName, generatedContent }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);
    const [error, setError] = useState('');

    const handleSaveToFileBaby = async () => {
        if (!userName) {
            setError('User name is not defined. Cannot save to specific folder.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const containerUrl = 'https://filebaby.blob.core.windows.net/filebabyblob';
            const sasToken = process.env.REACT_APP_SAS_TOKEN;
            const uniqueFileName = `${new Date().getTime()}-generated-page.html`;
            const filePath = `${containerUrl}/${userName}/${uniqueFileName}?${sasToken}`;
            const blob = new Blob([generatedContent], { type: 'text/html' });

            const response = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': 'text/html',
                },
                body: blob,
            });

            if (!response.ok) {
                throw new Error(`Failed to save to File Baby with status: ${response.status}`);
            }

            setSavedToFileBaby(true);
            setTimeout(() => setSavedToFileBaby(false), 3000); // Reset after 3 seconds
        } catch (error) {
            console.error('Error saving to File Baby:', error);
            setError(`Error saving to File Baby: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbox-container">
            <div className="chatbox">
                {/* Display chat messages and generated content here */}
                <div className="generated-content">
                    {generatedContent}
                </div>
            </div>
            <TooltipIcon title="Save the generated web page to File Baby" />
            <button className="save-button" onClick={handleSaveToFileBaby} disabled={isLoading}>
                Save to File Baby
            </button>
            {isLoading && <p>Saving...</p>}
            {error && <p className="error">{error}</p>}
            {savedToFileBaby && <p>Web page saved to File Baby successfully!</p>}
        </div>
    );
};

export default ChatboxWithSaveButton;
