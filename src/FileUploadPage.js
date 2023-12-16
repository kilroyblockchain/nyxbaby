import React, { useState } from 'react';

function FileUploadPage({ userName }) {
    const [manifestFile, setManifestFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const [imageFileType, setImageFileType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResponse, setUploadResponse] = useState(null);
    const [error, setError] = useState('');
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);

    const handleManifestFileChange = (event) => {
        console.log('Manifest file selected:', event.target.files[0]);
        setManifestFile(event.target.files[0]);
    };

    const handleImageFileChange = (event) => {
        console.log('Image file selected:', event.target.files[0]);
        setImageFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        console.log('Submitting files. Manifest:', manifestFile, 'Image:', imageFile);

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

            // Reset file states after successful upload
            console.log('Resetting file states after upload');
            setManifestFile(null);
            setImageFile(null);
        } catch (error) {
            console.error('Error uploading files:', error);
            setError(`Error uploading files: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToFileBaby = async () => {
        console.log('Saving to File Baby. Image file name:', imageFileName);
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

            // Reset all file-related states after saving to File Baby
            console.log('Resetting file states after saving to File Baby');
            setManifestFile(null);
            setImageFile(null);
            setImageFileName('');
            setImageFileType('');
            setUploadResponse(null);
        } catch (error) {
            console.error('Error saving to File Baby:', error);
            setError(`Error saving to File Baby: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>2. Upload Manifest and Image</h1>
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
                    <label htmlFor="imageFile">Image File:</label>
                    <input
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
        </div>
    );
}

export default FileUploadPage;
