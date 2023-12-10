import React, { useState } from 'react';

const ManifestGenerator = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        service: '',
        purpose: '',
        profileLink: '',
        // ... other fields
    });
    const [manifest, setManifest] = useState(null);

    const questions = [
        { label: 'Title', name: 'title' },
        { label: 'Author', name: 'author' },
        { label: 'Description', name: 'description' },
        { label: 'Distribution Service', name: 'service' },
        { label: 'Purpose of Distribution', name: 'purpose' },
        { label: 'Profile Link (Behance, LinkedIn, Instagram)', name: 'profileLink' },
        // ... other questions
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (currentStep < questions.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const generateManifest = () => {
        const generatedManifest = {
            alg: "ps256",
            // ... other static fields
            title: formData.title,
            ingredients: [
                // ... ingredients fields
            ],
            assertions: [
                {
                    label: "stds.schema-org.CreativeWork",
                    data: {
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        "author": [
                            {
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
                }
            ],
            distribution: {
                service: formData.service,
                purpose: formData.purpose,
            },
            profileLink: formData.profileLink
            // ... other manifest fields
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
        <div>
            {currentStep < questions.length ? (
                <div>
                    <label>{questions[currentStep].label}</label>
                    <input
                        type="text"
                        name={questions[currentStep].name}
                        value={formData[questions[currentStep].name]}
                        onChange={handleChange}
                    />
                    <button onClick={nextStep}>Next</button>
                </div>
            ) : manifest ? (
                <div>
                    <h3>Generated Manifest:</h3>
                    <pre>{JSON.stringify(manifest, null, 2)}</pre>
                    <button onClick={downloadJson}>Download JSON</button>
                </div>
            ) : (
                <button onClick={generateManifest}>Generate Manifest</button>
            )}
        </div>
    );
};

export default ManifestGenerator;
