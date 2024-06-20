import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from "./authConfig";
import TenantFileGallery from './TenantFileGallery';
import FileUploadPage from './FileUploadPage';
import ManifestGenerator from "./ManifestGenerator";
import ManifestRetriever from "./ManifestRetriever";
import Imagebot from "./Imagebot";
import logo from './logo.png';
import PromptLibrary from "./PromptLibrary";
import TextToImage from "./TextToImage";
import ClaimedFileUploader from "./ClaimedFileUploader";
import SignInImage from "./ms_signin_dark.png";
import { SignOutButton } from './SignOutButton';
import DragAndDropMediaPlayer from "./DragAndDropMediaPlayer";
import UseWithNyxPage from './UseWithNyxPage';
import NyxFileBabyModule from './NyxFileBabyModule';

function SignInButton() {
    const { instance } = useMsal();
    const handleLogin = () => {
        instance.loginRedirect().catch(e => {
            console.error(e);
        });
    };

    return <button className={"msbutton"} onClick={handleLogin}><img src={SignInImage} alt={"Sign in to File Baby with Microsoft"} /></button>;
}

function HomePage({ isAuthenticated, isDevelopment, userName }) {
    return (
        <>
            <TenantFileGallery userName={userName} />
            <hr />
            <ManifestRetriever />
            <hr />
            <ManifestGenerator />
            <FileUploadPage userName={userName} />
            <hr />
            <PromptLibrary userName={userName} />
            <hr />
            <Imagebot userName={userName} />
            <hr />
            <TextToImage />
            <hr />
            <ClaimedFileUploader userName={userName} />
            <hr />
            <DragAndDropMediaPlayer />
            <hr />
            <NyxFileBabyModule userName={userName} />
        </>
    );
}

function AppContent() {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userName = isDevelopment ? "kilroy@uark.edu" : accounts?.[0]?.username;

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} alt="my.file.baby... MINE!" className="responsive" />
                {isAuthenticated && <SignOutButton />}
            </header>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated || isDevelopment ? (
                            <HomePage isAuthenticated={isAuthenticated} isDevelopment={isDevelopment} userName={userName} />
                        ) : (
                            <SignInButton />
                        )
                    }
                />
                <Route path="/use-with-nyx" element={<UseWithNyxPage />} />
            </Routes>
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
            <Router>
                <AppContent />
            </Router>
        </MsalProvider>
    );
}

export default App;
