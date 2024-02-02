import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './SharedGallery.css';

function SharedGallery() {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();

    useEffect(() => {
        const baseUrl = "https://claimed.at.file.baby/filebabyblob"; // Replace with your actual URL

        const fetchFilesByIds = (fileNames) => {
            return fileNames.map(encodedFileName => {
                const decodedFileName = decodeURIComponent(encodedFileName);
                const safeFileName = decodedFileName.split('/').pop().replace(/\s/g, '%20');
                return {
                    id: decodedFileName,
                    name: decodedFileName,
                    thumbnailUrl: `${baseUrl}${safeFileName}`
                };
            });
        };

        const queryParams = new URLSearchParams(location.search);
        const fileNames = queryParams.get('files')?.split(',') || [];

        if (fileNames.length) {
            setIsLoading(true);
            // As fetchFilesByIds is not asynchronous, no need for then/catch or async/await
            const fetchedFiles = fetchFilesByIds(fileNames);
            setFiles(fetchedFiles);
            setIsLoading(false);
        } else {
            setError('No files selected for this gallery.');
            setIsLoading(false);
        }
    }, [location.search]);

    if (isLoading) {
        return <div className="shared-gallery-loading">Loading...</div>;
    }

    if (error) {
        return <div className="shared-gallery-error">Error: {error}</div>;
    }

    return (
        <div className="shared-gallery">
            <h2>Shared Gallery</h2>
            <div className="files">
                {Array.isArray(files) && files.map(file => ( // Ensure 'files' is an array
                    <div key={file.id} className="file-item">
                        <img src={file.thumbnailUrl} alt={file.name} className="file-thumbnail" />
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div className="claim-files">
                <a href="https://file.baby" className="claim-files-button">Claim my files at File Baby</a>
            </div>
        </div>
    );
}

export default SharedGallery;
