import React, { useState } from 'react';

function FileUploadPage() {
    const [manifestFile, setManifestFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResponse, setUploadResponse] = useState(null);
    const [error, setError] = useState('');

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
            formData.append('file', manifestFile); // Append manifest file under the key 'file'
        }
        if (imageFile) {
            formData.append('file', imageFile); // Append image file under the same key 'file'
        }

        try {
            const response = await fetch('https://paybots-claim-engine.azurewebsites.net/api/http_example', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`File upload failed with status: ${response.status}`);
            }

            const responseData = await response.arrayBuffer(); // Since the response is an image
            setUploadResponse(responseData);
        } catch (error) {
            console.error('Error uploading files:', error);
            setError(`Error uploading files: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            <h1>Upload Manifest and Image</h1>
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
            {uploadResponse && <div>
                <h2>VOILA! Your signed file awaits.</h2>
                <h3>You can drag it to your desktop and then to the verifier to see the credentials.</h3>
                {/* Display the image from the response */}
                {uploadResponse && <img src={URL.createObjectURL(new Blob([uploadResponse]))} alt="Processed" />}
            </div>}
        </div>
    );
}

export default FileUploadPage;
