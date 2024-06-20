import React from 'react';
//import { useIsAuthenticated } from "@azure/msal-react";

function FooterSection() {
    //const isAuthenticated = useIsAuthenticated();

    return (
        <footer className="footer">
            <p><a href="https://file.baby">Privacy Policy & Terms of Use</a></p>
            <p><a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer">Validate Files at Content Authenticity Initiative</a></p>
            <p>&copy; Copyright 2024, <a href="https://file.baby" alt="File Baby" title={"File Baby"}>File Baby</a>, All Rights Reserved</p>
        </footer>
    );
}

export default FooterSection;
