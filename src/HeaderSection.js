import React from 'react';
import logo from "./img/NYX_NoCode-home.png";
import { SignOutButton } from "./SignOutButton";
import { useIsAuthenticated } from "@azure/msal-react";

function HeaderSection() {
    const isAuthenticated = useIsAuthenticated();

    return (
        <header className="App-header">
            <img src={logo} alt="my.file.baby... MINE!" className="responsive" />
            {isAuthenticated && <SignOutButton />}
        </header>
    );
}

export default HeaderSection;
