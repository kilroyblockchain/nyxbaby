import React from "react";
import { useMsal } from "@azure/msal-react";

export const SignOutButton = () => {
    const { instance } = useMsal();

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: "https://basic-my.file.baby",
        });
    };

    return (
        <button onClick={handleLogout}>
            Sign Out
        </button>
    );
};
