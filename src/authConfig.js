// authConfig.js
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
    auth: {
//        clientId: "ab50efea-8566-4d5f-a0e6-ca5e869f0f53",
//        authority: "https://login.microsoftonline.com/73bc0c96-da02-4596-acb7-953c57ed55ac",
//        redirectUri: "https://dev2-my.file.baby"
        clientId: "2be92905-5f2c-49bb-a1ba-3664388dd3a8",
        authority: "https://login.microsoftonline.com/73bc0c96-da02-4596-acb7-953c57ed55ac",
        redirectUri: "https://my.file.baby"
//        clientId: "cecf9ab2-8682-4ad6-9f85-3812fe5efba0",
//        authority: "https://login.microsoftonline.com/73bc0c96-da02-4596-acb7-953c57ed55ac",
//       redirectUri: "https://dev-my.file.baby"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
