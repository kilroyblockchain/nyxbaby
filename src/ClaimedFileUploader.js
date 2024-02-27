import React, { useState } from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);
const ClaimedFileUploader = ({ userName }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSaveToFileBaby = async () => {
        if (!file || !userName) {
            setError('No file selected or user name is not defined.');
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const manifestResponse = await fetch('https://paybots-claim-engine.azurewebsites.net/api/manifest', {
                method: 'POST',
                body: formData,
            });

            if (manifestResponse.status === 500) {
                throw new Error("No Manifest Found");
            }

            if (!manifestResponse.ok) {
                throw new Error(`Manifest retrieval failed with status: ${manifestResponse.status}`);
            }

            const manifestData = await manifestResponse.json();

            if (manifestData) {
                await handleSaveToFileBaby();
            } else {
                throw new Error("No Manifest Found.");
            }
        } catch (error) {
            console.error('Error:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatFB">
            <h1>Upload Claimed File</h1>
            <form onSubmit={handleSubmit}>
                <TooltipIcon title="Upload a previously C2PA claimed image file to File Baby, keeping C2PA credentials intact. Example: File generated form DALL-E, or Adobe Photoshop. 100MB maximum file size." />
                <div>
                    <input
                        tabIndex={"0"}
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        title={"Choose any Image File Containing C2PA Credentials"}
                        //accept="image/*" // This line limits the file input to image files only
                    />
                    <button tabIndex={"0"} type="submit" title="Upload Image File to File Baby" disabled={isLoading || !file}>Upload File</button>
                </div>
            </form>

            {isLoading && <p>Checking for manifest and uploading...</p>}
            {error && <p className="error">{error}</p>}
            {savedToFileBaby && <p>File saved to File Baby successfully!</p>}
        </div>
    );
};

export default ClaimedFileUploader;

