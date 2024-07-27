import React, { useState, useEffect } from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);

function FileUploadPage({ userName }) {
    const [manifestFile, setManifestFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const [imageFileType, setImageFileType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResponse, setUploadResponse] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [error, setError] = useState('');
    const [savedToFileBaby, setSavedToFileBaby] = useState(false);

    const handleManifestFileChange = (event) => {
        setManifestFile(event.target.files[0]);
    };

    const handleImageFileChange = (event) => {
        const originalFile = event.target.files[0];
        const uniqueTimeStamp = new Date().getTime();
        const uniqueFileName = `${uniqueTimeStamp}-${originalFile.name}`;

        const imageFileWithUniqueName = new File([originalFile], uniqueFileName, {
            type: originalFile.type,
            lastModified: originalFile.lastModified,
        });

        setImageFile(imageFileWithUniqueName);
        setImageFileName(uniqueFileName);
        setImageFileType(originalFile.type);
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

            // Check the type of the uploaded file and set the thumbnail accordingly
            if (imageFileType.startsWith('audio/')) {
                setThumbnailUrl('./audio_placeholder.png');
            } else {
                // For non-audio files, use the file's data to create a Blob URL
                const blob = new Blob([responseData], { type: imageFileType });
                setThumbnailUrl(URL.createObjectURL(blob));
            }

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
            setTimeout(() => setSavedToFileBaby(false), 3000); // Reset after 3 seconds
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

    useEffect(() => {
        // This will run when the component unmounts or when thumbnailUrl changes
        return () => {
            if (thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [thumbnailUrl]);

    useEffect(() => {
        if (savedToFileBaby) {
            // Perform actions when savedToFileBaby is true
            // For example, display a success message
        }
        // This effect will run every time savedToFileBaby changes
    }, [savedToFileBaby]);

    return (
        <div className={'manifestUpload'}>
            <h3>2. Upload Manifest and Image, Audio or Video</h3>
            <form onSubmit={handleSubmit}>
                <TooltipIcon title="Submit your file and its manifest to claim ownership, then click Save to File Baby to store and share it. Refresh your browser page between file uploads. 100MB maximum file size." />
                <div>
                    <label htmlFor="manifestFile">Manifest File</label>
                    <div className="footnote">
                    </div>
                    <input
                        tabIndex={"0"}
                        id="manifestFile"
                        type="file"
                        onChange={handleManifestFileChange}
                        accept=".json"
                        title={"Select a Manifest File"}
                    />
                </div>
                <b>AND</b>
                <div>
                    <label htmlFor="imageFile">Image, Audio or Video File</label>
                    <div className="footnote">Supported are .jpeg, .jpg, .png, .tiff, .webp, .svg, .mp3, .m4a, .wav, .avi, avif, .mp4, .mov, .mpeg or .webm. 100 megabyte limit.
                    </div>
                    <input
                        tabIndex={"0"}
                        id="imageFile"
                        type="file"
                        onChange={handleImageFileChange}
                        accept="image/avif, image/jpeg, image/png, image/tiff, image/webp, image/svg+xml, audio/mpeg, audio/m4a, audio/x-m4a, audio/aac, audio/wav, video/avi, video/mp4, video/quicktime, video/mpeg, video/webm, text/plain, application/pdf"
                        title={"Select a File to Claim"}
                    />
                </div>

                <button
                    tabIndex={"0"}
                    type="submit"
                    title={"Upload Selected Manifest and File to be Claimed"}
                    disabled={isLoading || !manifestFile || !imageFile}>
                    Upload Files
                </button>
            </form>

            {isLoading && <p>Uploading...</p>}
            {error && <p className="error">{error}</p>}
            {uploadResponse && !savedToFileBaby && (
                <div className={"signed"}>
                    <img src={thumbnailUrl} alt="Processed" className={"signed"} />
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
