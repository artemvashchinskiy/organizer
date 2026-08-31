import type {

    OneDriveConnection

} from "../types/oneDrive";


import {

    generateCodeChallenge,

    generateCodeVerifier

} from "./pkce";


import {

    listOneDriveBackups,

    uploadOneDriveBackup,

    downloadOneDriveBackup,

    deleteOneDriveBackup

} from "./oneDriveApi";


const CLIENT_ID =

    import.meta.env.VITE_ONEDRIVE_CLIENT_ID;


const AUTHORITY =

    "https://login.microsoftonline.com/common/oauth2/v2.0";


const TOKEN_KEY =

    "onedrive-connection";


const VERIFIER_KEY =

    "onedrive-pkce-verifier";


const STATE_KEY =

    "onedrive-oauth-state";


const SCOPES =

    [

        "offline_access",

        "User.Read",

        "Files.ReadWrite"

    ].join(" ");


/* --------------------------------
   REDIRECT URI
-------------------------------- */

function getRedirectUri(): string {

    return (

        window.location.origin

        +

        "/"

    );

}


/* --------------------------------
   CONNECTION
-------------------------------- */

export function getOneDriveConnection():

    OneDriveConnection | null {

    const json =

        localStorage.getItem(

            TOKEN_KEY

        );


    if (!json) {

        return null;

    }


    try {

        const connection =

            JSON.parse(

                json

            ) as OneDriveConnection;


        if (

            !connection.accessToken

            ||

            connection.expiresAt <= Date.now()

        ) {

            localStorage.removeItem(

                TOKEN_KEY

            );

            return null;

        }


        return connection;

    }

    catch {

        localStorage.removeItem(

            TOKEN_KEY

        );

        return null;

    }

}


/* --------------------------------
   IS CONNECTED
-------------------------------- */

export function isOneDriveConnected():

    boolean {

    return (

        getOneDriveConnection()

        !== null

    );

}


/* --------------------------------
   CONNECT
-------------------------------- */

export async function connectOneDrive():

    Promise<void> {

    if (!CLIENT_ID) {

        throw new Error(

            "VITE_ONEDRIVE_CLIENT_ID is not configured."

        );

    }


    const verifier =

        generateCodeVerifier();


    const challenge =

        await generateCodeChallenge(

            verifier

        );


    const state =

        crypto.randomUUID();


    localStorage.setItem(

        VERIFIER_KEY,

        verifier

    );


    localStorage.setItem(

        STATE_KEY,

        state

    );


    const params =

        new URLSearchParams({

            client_id:
                CLIENT_ID,

            response_type:
                "code",

            redirect_uri:
                getRedirectUri(),

            response_mode:
                "query",

            scope:
                SCOPES,

            state,

            code_challenge:
                challenge,

            code_challenge_method:
                "S256"

        });


    window.location.assign(

        `${AUTHORITY}/authorize?${params.toString()}`

    );

}


/* --------------------------------
   COMPLETE OAUTH CALLBACK
-------------------------------- */

export async function completeOneDriveAuthCallback():

    Promise<OneDriveConnection | null> {

    const params =

        new URLSearchParams(

            window.location.search

        );


    const code =

        params.get(

            "code"

        );


    const returnedState =

        params.get(

            "state"

        );


    const error =

        params.get(

            "error"

        );


    if (

        !code

        &&

        !error

    ) {

        return null;

    }


    if (error) {

        const description =

            params.get(

                "error_description"

            );


        throw new Error(

            description || error

        );

    }


    const savedState =

        localStorage.getItem(

            STATE_KEY

        );


    const verifier =

        localStorage.getItem(

            VERIFIER_KEY

        );


    if (

        !savedState

        ||

        !returnedState

        ||

        savedState !== returnedState

    ) {

        throw new Error(

            "Invalid OneDrive OAuth state."

        );

    }


    if (!verifier) {

        throw new Error(

            "OneDrive PKCE verifier is missing."

        );

    }


    if (!code) {

    throw new Error(
        "OneDrive authorization code is missing."
    );

    }

    const body =

        new URLSearchParams({

            client_id:
                CLIENT_ID,

            grant_type:
                "authorization_code",

            code,

            redirect_uri:
                getRedirectUri(),

            code_verifier:
                verifier

        });


    const response =

        await fetch(

            `${AUTHORITY}/token`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                },

                body

            }

        );


    if (!response.ok) {

        const text =

            await response.text();


        throw new Error(

            `OneDrive token exchange failed: ${text}`

        );

    }


    const token =

        await response.json();


    const connection:

        OneDriveConnection = {

            accessToken:
                token.access_token,

            expiresAt:

                Date.now()

                +

                (

                    (token.expires_in || 3600)

                    *

                    1000

                ),

            refreshToken:
                token.refresh_token

        };


    localStorage.setItem(

        TOKEN_KEY,

        JSON.stringify(

            connection

        )

    );


    localStorage.removeItem(

        VERIFIER_KEY

    );


    localStorage.removeItem(

        STATE_KEY

    );


    window.history.replaceState(

        {},

        document.title,

        window.location.pathname

    );


    return connection;

}


/* --------------------------------
   DISCONNECT
-------------------------------- */

export function disconnectOneDrive():

    void {

    localStorage.removeItem(

        TOKEN_KEY

    );

}


/* --------------------------------
   WRAPPERS
-------------------------------- */

export async function backupToOneDrive(

    notes: unknown,

    filename: string

) {

    const connection =

        getOneDriveConnection();


    if (!connection) {

        throw new Error(

            "OneDrive is not connected."

        );

    }


    return uploadOneDriveBackup(

        connection.accessToken,

        filename,

        notes

    );

}


export async function getOneDriveBackups() {

    const connection =

        getOneDriveConnection();


    if (!connection) {

        throw new Error(

            "OneDrive is not connected."

        );

    }


    return listOneDriveBackups(

        connection.accessToken

    );

}


export async function restoreFromOneDrive(

    fileId: string

) {

    const connection =

        getOneDriveConnection();


    if (!connection) {

        throw new Error(

            "OneDrive is not connected."

        );

    }


    return downloadOneDriveBackup(

        connection.accessToken,

        fileId

    );

}


export async function removeOneDriveBackup(

    fileId: string

) {

    const connection =

        getOneDriveConnection();


    if (!connection) {

        throw new Error(

            "OneDrive is not connected."

        );

    }


    return deleteOneDriveBackup(

        connection.accessToken,

        fileId

    );

}