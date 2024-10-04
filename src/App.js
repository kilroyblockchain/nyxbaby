import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from "./authConfig";
import HeaderSection from "./HeaderSection";
import TenantFileGallery from './TenantFileGallery';
import Imagebot from "./Imagebot";
import SignInImage from "./ms_signin_dark.png";
import UseWithNyxPage from './UseWithNyxPage';
import FooterSection from "./FooterSection";
import FileUpload from "./FileUploader";

function SignInButton() {
    const { instance } = useMsal();
    const handleLogin = () => {
        instance.loginRedirect().catch(e => {
            console.error(e);
        });
    };

    return <button className={"msbutton"} onClick={handleLogin}><img src={SignInImage} alt={"Sign in to File Baby with Microsoft"} /></button>;
}

function HomePage({ userName }) {
    return (
        <>
            <TenantFileGallery userName={userName} />
            <hr />
            <FileUpload />
            <hr />
            <Imagebot userName={userName} />
            <hr />

        </>
    );
}

function AppContent() {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userName = isDevelopment ? "kilroy@uark.edu" : accounts?.[0]?.username;

    const location = useLocation();

    const isUseWithNyxPage = location.pathname === "/use-with-nyx";

    console.log("AppContent userName:", userName); // Debugging line

    return (
        <div className={`App ${!isUseWithNyxPage ? 'file-baby-home' : ''}`}>
            {!isUseWithNyxPage && <HeaderSection />}
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated || isDevelopment ? (
                            <HomePage userName={userName} />
                        ) : (
                            <SignInButton />
                        )
                    }
                />
                <Route path="/use-with-nyx" element={<UseWithNyxPage userName={userName} />} />
            </Routes>
            {!isUseWithNyxPage && <FooterSection />}
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
