import React, { useState } from 'react';
import './App.css';
import TenantFileGallery from './TenantFileGallery';
import logo from './logo.png';
import FileUploadPage from './FileUploadPage';
import ManifestGenerator from "./ManifestGenerator";
import ManifestRetriever from "./ManifestRetriever";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from "./authConfig";
import Imagebot from "./Imagebot";
import Chatbot from "./Chatbot";
import caifb from './CAI-FB-800.png'

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
                <img src={logo} alt="my.file.baby... MINE!" className="responsive"/>
            </header>
                {isAuthenticated || isDevelopment ? (
                    <div>
                        <TenantFileGallery userName={userName} filterCriteria={filterCriteria} /> {/* Passing filterCriteria */}
                        <hr />
                        <Imagebot userName={userName} />
                        <hr />
                        <ManifestRetriever />
                        <hr />
                        <ManifestGenerator />
                        <FileUploadPage userName={userName} />
                        <hr />
                        <Chatbot setFilterCriteria={setFilterCriteria} /> {/* Passing setFilterCriteria */}

                    </div>
                ) : (
                    <SignInButton />
                )}


            <footer className="footer">

                <p>
                    <a href="https://file.baby">Privacy Policy & Terms of Use</a>
                </p>
                <p>
                    To inspect your content, use <a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer">contentcredentials.org/verify</a>
                </p>
                <p>
                    <img src={caifb} alt="File Baby is a member of Content Authenticity Initiative" className="responsive" />
                </p>

                <p>
                    &copy; Copyright 2024, <a href={"https://file.baby"} alt={"File Baby"}>File Baby</a>, All Rights Reserved
                </p>

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
