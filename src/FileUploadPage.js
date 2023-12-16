import React, { useState, useRef, useEffect, useCallback } from 'react';

function FileUploadPage({ userName }) {
    const [manifestFile, setManifestFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(false);
        setError('');
        setSavedToFileBaby(false);
        resetFileInputs();
    }, [resetFileInputs]);

    const handleManifestFileChange = (event) => {
        setManifestFile(event.target.files[0]);
    };

    const handleImageFileChange = (event) => {
        setImageFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        // Add your file upload logic here
        // Remember to use manifestFile and imageFile in your logic

        // Example: console.log(manifestFile, imageFile);
        // Reset the form and state after handling the submission
        resetAllStates();
    };

    const handleSaveToFileBaby = async () => {
        // Add your logic to save to File Baby here
        // Example: console.log('Saving to File Baby');
        // Update the state as needed after saving
        setSavedToFileBaby(true);
        resetAllStates();
    };

    useEffect(() => {
        resetAllStates();
    }, [resetAllStates]);

    return (
        <div>
            <h1>2. Upload Manifest and Image</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="manifestFile">Manifest File:</label>
                    <input
                        ref={manifestFileInput}
                        id="manifestFile"
                        type="file"
                        onChange={handleManifestFileChange}
                        accept=".json"
                    />
                </div>
                <div>
                    <label htmlFor="imageFile">Image File:</label>
                    <input
                        ref={imageFileInput}
                        id="imageFile"
                        type="file"
                        onChange={handleImageFileChange}
                        accept="image/jpeg,image/png"
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    Upload Files
                </button>
            </form>

            {isLoading && <p>Uploading...</p>}
            {error && <p className="error">{error}</p>}
            {savedToFileBaby && <p>Image saved to File Baby successfully!</p>}
        </div>
    );
}

export default FileUploadPage;
