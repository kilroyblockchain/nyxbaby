import React, { useState } from 'react';
import './App.css';
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from "./authConfig";
import TenantFileGallery from './TenantFileGallery';
import ManifestRetriever from "./ManifestRetriever";
import logo from './logo.png';
import ClaimedFileUploader from "./ClaimedFileUploader";
import SignInImage from "./ms_signin.png";
import { SignOutButton } from './SignOutButton'; // Import the SignOutButton component

function SignInButton() {
    const {instance} = useMsal();
    const handleLogin = () => {
        instance.loginRedirect().catch(e => {
            console.error(e);
        });
    };

    return <button className={"msbutton"} onClick={handleLogin}><img src={SignInImage}
                                                                     alt={"Sign in to File Baby with Microsoft"}/>
    </button>;
}
function AppContent() {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userName = isDevelopment ? "kilroy@uark.edu" : accounts?.[0]?.username;


    // State to hold the search/filter criteria
    const [filterCriteria, setFilterCriteria] = useState('');

    // Function to handle search input changes (assuming you have an input field for search)
    const handleSearchChange = (event) => {
        setFilterCriteria(event.target.value);
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} alt="my.file.baby... MINE!" className="responsive"/>
                {isAuthenticated && <SignOutButton />}
            </header>
            {isAuthenticated || isDevelopment ? (
                <>
                    {/* Assuming you want a search input field */}
                    <input type="hidden" value={filterCriteria} onChange={handleSearchChange} placeholder="Search..." />
                    <TenantFileGallery userName={userName} filterCriteria={filterCriteria} />
                    <hr />
                    <ManifestRetriever />
                    <hr />
                    <ClaimedFileUploader userName={userName} />
                    <hr />
                    <p>*You are using File Baby Basic, which has limited features and allows image files only. To upload claimed audio and video, as well as enjoy other File Baby features like issuing credits for your own non-claimed files; File Baby AI Image Generator; File Baby AI Chatbot; File Baby Prompt Library, and more–upgrade to File Baby Pro.</p>
                </>
            ) : (
                <SignInButton />
            )}
            <footer className="footer">
                <p><a href="https://file.baby">Privacy Policy & Terms of Use</a></p>
                <p><a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer">Validate Files at Content Authenticity Initiative</a></p>
                <p>Need a Login? <a href={"https://subscribe.file.baby"}>Subscribe here.</a></p>
                <p>&copy; Copyright 2024, <a href="https://file.baby" alt="File Baby" title={"File Baby"}>File Baby</a>, All Rights Reserved</p>
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

