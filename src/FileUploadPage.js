import React, { useState, useRef, useEffect } from 'react';

function FileUploadPage({ userName }) {
    const [key, setKey] = useState(0); // key for forcing remount
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

    // Function to reset all states to initial
    const resetAllStates = () => {
        setManifestFile(null);
        setImageFile(null);
        setImageFileName('');
        setImageFileType('');
        setUploadResponse(null);
        setSavedToFileBaby(false);
        setError('');
        setIsLoading(false);
        resetFileInputs();
    };

    // Function to reset the file input fields
    const resetFileInputs = () => {
        if (manifestFileInput.current) manifestFileInput.current.value = "";
        if (imageFileInput.current) imageFileInput.current.value = "";
    };

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

        const formData = new FormData();
        if (manifestFile) {
            formData.append('file', manifestFile);
        }
        if (imageFile) {
            formData.append('file', imageFile);
            setImageFileName(imageFile.name);
            setImageFileType(imageFile.type);
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
            setUploadResponse(responseData);

            // Reset file inputs after successful upload
            resetFileInputs();
        } catch (error) {
            console.error('Error uploading files:', error);
            setError(`Error uploading files: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToFileBaby = async () => {
        if (!userName) {
            setError('User name is not defined. Cannot save to specific folder.');
            return;
        }

        setIsLoading(true);
        try {
            if (!uploadResponse) {
                setError('No file uploaded to save.');
                return;
            }

            const containerUrl = 'https://filebaby.blob.core.windows.net/filebabyblob';
            const sasToken = process.env.REACT_APP_SAS_TOKEN;
            const filePath = `${containerUrl}/${userName}/${imageFileName}?${sasToken}`;
            const mimeType = imageFileType;

            const response = await fetch(filePath, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': mimeType,
                },
                body: new Blob([uploadResponse], { type: mimeType }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save to File Baby with status: ${response.status}`);
            }

            setSavedToFileBaby(true);

            // Reset all states after saving to File Baby
            resetAllStates();
        } catch (error) {
            console.error('Error saving to File Baby:', error);
            setError(`Error saving to File Baby: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to force the component to remount
    const refreshComponent = () => {
        resetAllStates();
        setKey(prevKey => prevKey + 1); // Change the key to force remount
    };

    useEffect(() => {
        // Reset states to initial when component mounts
        resetAllStates();
    }, [key]); // Dependency array contains key, so it runs when key changes

    return (
        <div key={key}> {/* Using the key to force remount */}
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
                <button
                    type="submit"
                    disabled={isLoading || !manifestFile || !imageFile}>
                    Upload Files
                </button>
            </form>

            {isLoading && <p>Uploading...</p>}
            {error && <p className="error">{error}</p>}
            {uploadResponse && !savedToFileBaby && (
                <div>
                    <img src={URL.createObjectURL(new Blob([uploadResponse]))} alt="Processed" />
                    <button onClick={handleSaveToFileBaby} disabled={isLoading}>
                        Save to File Baby
                    </button>
                </div>
            )}

            {savedToFileBaby && <p>Image saved to File Baby successfully!</p>}
            {/* Example usage of refreshComponent (you can call this function based on your application's need) */}
            {/* <button onClick={refreshComponent}>Refresh Component</button> */}
        </div>
    );
}

export default FileUploadPage;
