import React, { useState } from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);

const FileUploader = ({ userName = 'defaultUserName' }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        console.log("File selected:", selectedFile);
    };

    const handleSaveToFileBaby = async () => {
        console.log('User Name:', userName);
        console.log('File:', file);

        if (!file) {
            setError('No file selected.');
            return;
        }

        if (!userName || userName.trim() === '') {
            setError('User name is not defined.');
            return;
        }

        setIsLoading(true);
        setError('');

        const containerUrl = 'https://filebaby.blob.core.windows.net/filebabyblob';
        const sasToken = process.env.REACT_APP_SAS_TOKEN;
        const filePath = `${containerUrl}/${userName}/${file.name}?${sasToken}`;

        try {
            const response = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!response.ok) {
                throw new Error(`Failed to save page with status: ${response.status}`);
            }

            setSavedToFileBaby(true);
            setTimeout(() => setSavedToFileBaby(false), 3000); // Reset after 3 seconds
        } catch (error) {
            console.error('Error saving page:', error);
            setError(`Error saving page: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await handleSaveToFileBaby();
    };

    return (
        <div className="chatFB">
            <h1>Upload File</h1>
            <form onSubmit={handleSubmit}>
                <TooltipIcon title="Upload a file to your Gallery. 100MB maximum file size." />
                <div>
                    <input
                        tabIndex={"0"}
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        title={"Choose any image file to upload"}
                        // accept="image/*" // This line limits the file input to image files only
                    />
                    <button tabIndex={"0"} type="submit" title="Upload Image File to File Baby" disabled={isLoading || !file}>Upload File</button>
                </div>
            </form>

            {isLoading && <p>Uploading...</p>}
            {error && <p className="error">{error}</p>}
            {savedToFileBaby && <p>File saved successfully!</p>}
        </div>
    );
};

export default FileUploader;
