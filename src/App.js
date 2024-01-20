import React, { useState } from 'react';
import './App.css';
import TenantFileGallery from './TenantFileGallery';
import logo from './logo.png';
import FileUploadPage from './FileUploadPage';
import ManifestGenerator from "./ManifestGenerator";
import ManifestRetriever from "./ManifestRetriever";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from "./authConfig";
import Chatbot from "./Chatbot";

function SignInButton() {
    const { instance } = useMsal();
    const handleLogin = () => {
        instance.loginPopup().catch(e => {
            console.error(e);
        });
    };

    return <button onClick={handleLogin}>Sign In</button>;
}

function AppContent() {
    const [filterCriteria, setFilterCriteria] = useState({}); // Added state for filter criteria
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const userName = isDevelopment ? "kilroy@uark.edu" : accounts?.[0]?.username;

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="responsive" alt="Logo" />
                {isAuthenticated || isDevelopment ? (
                    <div>
                        <Chatbot setFilterCriteria={setFilterCriteria} /> {/* Passing setFilterCriteria */}
                        <ManifestRetriever />
                        <TenantFileGallery userName={userName} filterCriteria={filterCriteria} /> {/* Passing filterCriteria */}
                        <ManifestGenerator />
                        <FileUploadPage userName={userName} />
                    </div>
                ) : (
                    <SignInButton />
                )}
            </header>
            <footer className="footer">
                {/* Footer content */}
            </footer>
        </div>
    );
}

function App() {
    return (
        <MsalProvider instance={msalInstance}>
            <AppContent />
        </MsalProvider>
    );
}

export default App;
