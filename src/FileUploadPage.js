import React, { useState, useRef, useEffect, useCallback } from 'react';

function FileUploadPage({ userName }) {
    const [manifestFile, setManifestFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const [imageFileType, setImageFileType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResponse, setUploadResponse] = useState(null);
    const [error, setError] = useState('');
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);

    // Refs for file inputs
    const manifestFileInput = useRef(null);
    const imageFileInput = useRef(null);

    // Function to reset the file input fields
    const resetFileInputs = useCallback(() => {
        if (manifestFileInput.current) manifestFileInput.current.value = "";
        if (imageFileInput.current) imageFileInput.current.value = "";
    }, []);

    // Function to reset all states to initial
    const resetAllStates = useCallback(() => {
        setManifestFile(null);
        setImageFile(null);
        setImageFileName('');
        setImageFileType('');
        setUploadResponse(null);
        setSavedToFileBaby(false);
        setError('');
        setIsLoading(false);
        resetFileInputs();
    }, [resetFileInputs]);

    // ... [rest of your event handlers]

    useEffect(() => {
        resetAllStates();
    }, [resetAllStates]);

    return (
        <div>
            <h1>2. Upload Manifest and Image</h1>
            {/* ... [rest of your component's JSX] */}
        </div>
    );
}

export default FileUploadPage;
