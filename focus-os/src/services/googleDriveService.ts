import type {
    GoogleDriveConnection
} from "../types/googleDrive";

import {
    listGoogleDriveBackups,
    uploadGoogleDriveBackup,
    downloadGoogleDriveBackup,
    deleteGoogleDriveBackup
} from "./googleDriveApi";

const CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID;


const SCOPES =
    "https://www.googleapis.com/auth/drive.file";


const TOKEN_KEY =
    "google-drive-token";


let tokenClient:
    any = null;


let scriptPromise:
    Promise<void> | null = null;


/* --------------------------------
   LOAD GOOGLE IDENTITY SERVICES
-------------------------------- */

function loadGoogleScript(): Promise<void> {

    if (
        typeof window !== "undefined" &&
        (window as any).google?.accounts?.oauth2
    ) {

        return Promise.resolve();

    }


    if (scriptPromise) {

        return scriptPromise;

    }


    scriptPromise =
        new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://accounts.google.com/gsi/client";


                script.async = true;

                script.defer = true;


                script.onload =
                    () => resolve();


                script.onerror =
                    () =>
                        reject(
                            new Error(
                                "Failed to load Google Identity Services."
                            )
                        );


                document.head.appendChild(
                    script
                );

            }
        );


    return scriptPromise;

}


/* --------------------------------
   GET SAVED TOKEN
-------------------------------- */

export function getGoogleDriveConnection():
    GoogleDriveConnection | null {

    const json =
        localStorage.getItem(
            TOKEN_KEY
        );


    if (!json) {

        return null;

    }


    try {

        const connection = JSON.parse(
            json
        ) as GoogleDriveConnection;


        if (
            !connection.accessToken ||
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
   CONNECT
-------------------------------- */

export async function connectGoogleDrive():
    Promise<GoogleDriveConnection> {

    if (!CLIENT_ID) {

        throw new Error(
            "VITE_GOOGLE_CLIENT_ID is not configured."
        );

    }


    await loadGoogleScript();


    return new Promise(
        (resolve, reject) => {

            const google =
                (window as any).google;


            tokenClient =
                google.accounts.oauth2.initTokenClient({

                    client_id:
                        CLIENT_ID,

                    scope:
                        SCOPES,

                    callback:
                        (response: any) => {

                            if (
                                response.error
                            ) {

                                reject(
                                    new Error(
                                        response.error
                                    )
                                );

                                return;

                            }


                            const connection:
                                GoogleDriveConnection = {

                                    accessToken:
                                        response.access_token,

                                    expiresAt:
                                        Date.now() +
                                        (
                                            (
                                                response.expires_in ||
                                                3600
                                            ) *
                                            1000
                                        )

                                };


                            localStorage.setItem(

                                TOKEN_KEY,

                                JSON.stringify(
                                    connection
                                )

                            );


                            resolve(
                                connection
                            );

                        }

                });


            tokenClient.requestAccessToken();

        }
    );

}


/* --------------------------------
   DISCONNECT
-------------------------------- */

export function disconnectGoogleDrive():

    void {

    localStorage.removeItem(
        TOKEN_KEY
    );

}


/* --------------------------------
   IS CONNECTED
-------------------------------- */

export function isGoogleDriveConnected():

    boolean {

    return (
        getGoogleDriveConnection()
        !== null
    );

}

/* --------------------------------
   GOOGLE DRIVE BACKUP
-------------------------------- */

export async function backupToGoogleDrive(
    notes: unknown,
    filename: string
){

    const connection =
        getGoogleDriveConnection();

    if (!connection) {

        throw new Error(
            "Google Drive is not connected."
        );

    }

    return uploadGoogleDriveBackup(
        connection.accessToken,
        filename,
        notes
    );

}


/* --------------------------------
   GOOGLE DRIVE BACKUPS
-------------------------------- */

export async function getGoogleDriveBackups(){

    const connection =
        getGoogleDriveConnection();

    if (!connection) {

        throw new Error(
            "Google Drive is not connected."
        );

    }

    return listGoogleDriveBackups(
        connection.accessToken
    );

}


/* --------------------------------
   GOOGLE DRIVE RESTORE
-------------------------------- */

export async function restoreFromGoogleDrive(
    fileId: string
){

    const connection =
        getGoogleDriveConnection();

    if (!connection) {

        throw new Error(
            "Google Drive is not connected."
        );

    }

    return downloadGoogleDriveBackup(
        connection.accessToken,
        fileId
    );

}


/* --------------------------------
   GOOGLE DRIVE DELETE
-------------------------------- */

export async function removeGoogleDriveBackup(
    fileId: string
){

    const connection =
        getGoogleDriveConnection();

    if (!connection) {

        throw new Error(
            "Google Drive is not connected."
        );

    }

    return deleteGoogleDriveBackup(
        connection.accessToken,
        fileId
    );

}