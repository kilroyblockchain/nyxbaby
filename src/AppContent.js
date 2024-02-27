import React from 'react';
import './App.css';
import TenantFileGallery from './TenantFileGallery';
import logo from './logo.png';
import FileUploadPage from './FileUploadPage';
import ManifestGenerator from "./ManifestGenerator";
import caifoj from "./cai-foj-800.png";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from "./authConfig";
import {SignOutButton} from "./SignOutButton";

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
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const userName = accounts?.[0]?.username; // Retrieve the username of the signed-in user

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} alt="my.file.baby... MINE!" className="responsive"/>
                {isAuthenticated && <SignOutButton />}
            </header>
                {isAuthenticated ? (
                    <>
                        <TenantFileGallery userName={userName} />
                        <ManifestGenerator />
                        {userName ? (
                            <FileUploadPage userName={userName} />
                        ) : (
                            <p>Please sign in to use the File Upload feature.</p>
                        )}
                    </>
                ) : (
                    <SignInButton />
                )}

            <footer className="footer">
                <p>
                    <a href="https://file.baby">About File Baby</a>
                </p>
                <p>
                    <img src={caifoj} alt="Friends of Justin" className="responsive" />
                </p>
                <p>
                    To inspect your content, use <a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer">contentcredentials.org/verify</a>
                </p>
                <p>
                    &copy; 2023-2024, <a href="https://friendsofjustin.knowbots.org">Friends of Justin</a>
                </p>
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
