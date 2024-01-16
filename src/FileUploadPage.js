import React, { useState } from 'react';

function FileUploadPage({ userName }) {
    const [manifestFile, setManifestFile] = useState(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResponse, setUploadResponse] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [error, setError] = useState('');

    const handleManifestFileChange = (event) => {
        setManifestFile(event.target.files[0]);
    };

    const handleFileChange = (event) => {
        const originalFile = event.target.files[0];
        setFile(originalFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        if (manifestFile) {
            formData.append('file', manifestFile);
        }
        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await fetch('https://paybots-claim-engine.azurewebsites.net/api/file_and_manifest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`File upload failed with status: ${response.status}`);
            }

            const responseData = await response.arrayBuffer();
            const blob = new Blob([responseData]);
            const url = URL.createObjectURL(blob);
            setUploadedFileUrl(url);
            setUploadResponse(responseData);
            setManifestFile(null);
            setFile(null);
        } catch (error) {
            console.error('Error uploading files:', error);
            setError(`Error uploading files: ${error.message}`);
        }finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            <h1>Upload Files</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="manifestFile">Manifest File:</label>
                    <input
                        id="manifestFile"
                        type="file"
                        onChange={handleManifestFileChange}
                        accept=".json"
                    />
                </div>
                <div>
                    <label htmlFor="fileInput">File (Image/Audio/Video):</label>
                    <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,audio/mp3,video/mp4"
                    />
                </div>
                <button type="submit" disabled={isLoading || !manifestFile || !file}>
                    Upload Files
                </button>
            </form>

            {isLoading && <p>Uploading...</p>}
            {error && <p className="error">{error}</p>}
            {uploadResponse && !isLoading && (
                <div>
                    <p>File uploaded successfully!</p>
                    <audio controls>
                        <source src={uploadedFileUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <br/>
                    <a href={uploadedFileUrl} download>
                        Download File
                    </a>
                </div>
            )}
        </div>
    );
}

export default FileUploadPage;