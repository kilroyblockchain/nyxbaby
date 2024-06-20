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
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userName = isDevelopment ? "kilroy@uark.edu" : accounts?.[0]?.username;

    const location = useLocation(); // To get the current route

    return (
        <div className="App">
            {/* Conditionally render header and footer */}
            {location.pathname !== "/use-with-nyx" && <HeaderSection />}

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

            {location.pathname !== "/use-with-nyx" && <FooterSection />}
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
