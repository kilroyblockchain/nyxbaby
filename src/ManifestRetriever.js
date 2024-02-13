import React, { useState } from 'react';
import tooltipIcon from './file_baby_tooltip_20px.png'; // Replace with the correct path

const TooltipIcon = ({ title }) => (
    <img tabIndex={"0"} src={tooltipIcon} alt="Tooltip" title={title} className="tooltip-icon" />
);

function ManifestRetriever() {
    const [file, setFile] = useState(null);
    const [manifest, setManifest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        setManifest(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('https://paybots-claim-engine.azurewebsites.net/api/manifest', {
                method: 'POST',
                body: formData,
            });

            if (response.status === 500) {
                throw new Error("No Manifest Found");
            }

            if (!response.ok) {
                throw new Error(`Manifest retrieval failed with status: ${response.status}`);
            }

            const responseData = await response.json();
            setManifest(responseData);
        } catch (error) {
            console.error('Error retrieving manifest:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={"inspectFile"}>
            <h1>Inspect a File</h1>
            <form onSubmit={handleSubmit}>
                <TooltipIcon title="Check any file for a C2PA manifest and display the JSON." />
                <div className="retrievedmanifest">
                    <label htmlFor="file">File:</label>
                    <input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        tabIndex={"0"}
                    />
                </div>
                <button
                    tabIndex={"0"}
                    type="submit"
                    disabled={isLoading || !file}>
                    Retrieve Manifest
                </button>
            </form>

            {isLoading && <p>Retrieving...</p>}
            {error && <p className="error">{error}</p>}
            {manifest && (
                <div>
                    <h2>Manifest</h2>
                    <pre>{JSON.stringify(manifest, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default ManifestRetriever;
