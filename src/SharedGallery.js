import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './SharedGallery.css';

function SharedGallery() {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();

    useEffect(() => {
        const baseUrl = "https://claimed.at.file.baby/filebabyblob"; // Replace with your actual base URL
        const userFolder = "kilroy@uark.edu"; // Dynamically match the logged-in user's email or folder name

        const fetchFilesByIds = (fileNames) => {
            return fileNames.map(encodedFileName => {
                const decodedFileName = decodeURIComponent(encodedFileName);
                const safeFileName = decodedFileName.split('/').pop().replace(/\s/g, '%20');
                const thumbnailUrl = `${baseUrl}/${encodeURIComponent(userFolder)}/${safeFileName}`; // Correctly form the thumbnail URL
                const url = `${baseUrl}/${userFolder}/${safeFileName}`; // Adjusted URL for full-sized image
                return {
                    id: decodedFileName,
                    name: safeFileName,
                    url: url, // Use the adjusted URL
                    thumbnailUrl: thumbnailUrl
                };
            });
        };

        const queryParams = new URLSearchParams(location.search);
        const fileNames = queryParams.get('files')?.split(',') || [];

        if (fileNames.length) {
            setIsLoading(true);
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
                {files.map(file => (
                    <div key={file.id} className="file-item">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <img src={file.thumbnailUrl} alt={file.name} className="file-thumbnail" />
                        </a>
                        <p>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SharedGallery;
