import React, { useState } from 'react';

const ManifestGenerator = () => {
    const [formData, setFormData] = useState({
        author: '',
        description: '',
        service: 'The World Wide Web',
        purpose: 'Content Distribution',
        profileId: '', // Use a default or empty string if dynamic input is needed
    });
    const [manifest, setManifest] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateManifest = () => {
        const generatedManifest = {
            alg: "ps256",
            ta_url: "http://timestamp.digicert.com",
            claim_generator: "my.file.baby",
            title: "Claimed at File.Baby",
            assertions: [
                {
                    label: "stds.schema-org.CreativeWork",
                    data: {
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        "author": [
                            {
                                "@id": formData.profileId,
                                "@type": "Person",
                                "name": formData.author
                            }
                        ]
                    }
                },
                {
                    label: "c2pa.actions",
                    data: {
                        "actions": [
                            {
                                "action": "created",
                                "description": formData.description
                            }
                        ]
                    }
                },
                // The following assertion seems static, so it is hardcoded here.
                // If it needs to be dynamic, similar inputs can be created as shown above.
                {
                    label: "c2pa.training-mining",
                    data: {
                        "entries": {
                            "c2pa.ai_generative_training": { "use": "notAllowed" },
                            "c2pa.ai_inference": { "use": "notAllowed" },
                            "c2pa.ai_training": { "use": "notAllowed" },
                            "c2pa.data_mining": { "use": "notAllowed" }
                        }
                    }
                }
            ],
            distribution: {
                service: formData.service,
                purpose: formData.purpose
            }
        };
        setManifest(generatedManifest);
    };

    const downloadJson = () => {
        const fileData = JSON.stringify(manifest, null, 2);
        const blob = new Blob([fileData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'manifest.json';
        link.href = url;
        link.click();
    };

    return (
        <div className="generator">
            <h1>Claim my file</h1>
            <h2>1. Generate Manifest</h2>
            {!manifest ? (
                <div className={"form-container"}>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="Author's Name"
                    />
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description"
                    />
                    <input
                        type="text"
                        name="profileId"
                        value={formData.profileId}
                        onChange={handleChange}
                        placeholder="LinkedIn, Instagram or Behance Profile URL"
                    />
                    <button onClick={generateManifest}>Generate Manifest</button>
                </div>
            ) : (
                <div>
                    <h3>Generated Manifest:</h3>
                    <pre>{JSON.stringify(manifest, null, 2)}</pre>
                    <button onClick={downloadJson}>Download Manifest</button>
                </div>
            )}
        </div>
    );
};

export default ManifestGenerator;
