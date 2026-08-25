import {

    generateCodeVerifier,

    generateCodeChallenge

} from "./pkce";

import type { Note } from "../types/note";

const APP_KEY = "mxmw4fjmtuduqkr";

const REDIRECT_URI = window.location.origin; 

let dropboxLoginPromise: Promise<boolean> | null = null;


export async function connectDropbox() {

    const token = localStorage.getItem(
        "dropbox-access-token"
    );

    if (token) {

        return true;

    }

    const verifier = generateCodeVerifier();

    const challenge = await generateCodeChallenge(verifier);

    const state = crypto.randomUUID();

    sessionStorage.setItem(

        "dropbox-code-verifier",

        verifier

    );

    sessionStorage.setItem(

        "dropbox-state",

        state

    );

    const scopes = [

        "files.content.write",

        "files.content.read",

        "files.metadata.read",

        "files.metadata.write"

    ].join(" ");

    const url =
        "https://www.dropbox.com/oauth2/authorize"
        + "?client_id=" + APP_KEY
        + "&response_type=code"
        + "&token_access_type=offline"
        + "&scope=" + encodeURIComponent(scopes)
        + "&code_challenge=" + challenge
        + "&code_challenge_method=S256"
        + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI)
        + "&state=" + state;

    window.location.href = url;

}

export function finishDropboxLogin(): Promise<boolean> {

    if (dropboxLoginPromise) {

        return dropboxLoginPromise;

    }

    dropboxLoginPromise = (async () => {

        const params = new URLSearchParams(
            window.location.search
        );

        const code = params.get("code");

        const state = params.get("state");

        if (!code || !state) {

            return false;

        }

        const savedState =
            sessionStorage.getItem(
                "dropbox-state"
            );

        const verifier =
            sessionStorage.getItem(
                "dropbox-code-verifier"
            );

        if (
            !savedState ||
            !verifier ||
            state !== savedState
        ) {

            throw new Error(
                "Dropbox OAuth state mismatch."
            );

        }

        const response = await fetch(
            "https://api.dropboxapi.com/oauth2/token",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                },

                body: new URLSearchParams({

                    code,

                    grant_type:
                        "authorization_code",

                    client_id:
                        APP_KEY,

                    code_verifier:
                        verifier,

                    redirect_uri:
                        REDIRECT_URI

                })

            }
        );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );

        }

        const data =
            await response.json();

        localStorage.setItem(
            "dropbox-access-token",
            data.access_token
        );

        localStorage.setItem(
            "dropbox-refresh-token",
            data.refresh_token
        );

        localStorage.setItem(
            "dropbox-token-expires",
            (
                Date.now()
                +
                data.expires_in * 1000
            ).toString()
        );

        sessionStorage.removeItem(
            "dropbox-code-verifier"
        );

        sessionStorage.removeItem(
            "dropbox-state"
        );

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        return true;

    })();

    return dropboxLoginPromise;
}

    


export async function getAccessToken(): Promise<string> {

    const expires = Number(

        localStorage.getItem(
            "dropbox-token-expires"
        )

    );

    if (

        !expires ||

        Date.now() >= expires

    ) {

        await refreshAccessToken();

    }

    const token =

        localStorage.getItem(
            "dropbox-access-token"
        );

    if (!token) {

        throw new Error(
            "Dropbox is not connected."
        );

    }

    return token;

}

export async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem(
            "dropbox-refresh-token"
        );

    if (!refreshToken) {

        throw new Error(
            "Missing refresh token."
        );

    }

    const response = await fetch(

        "https://api.dropboxapi.com/oauth2/token",

        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/x-www-form-urlencoded"

            },

            body: new URLSearchParams({

                grant_type: "refresh_token",

                refresh_token: refreshToken,

                client_id: APP_KEY

            })

        }

    );

    if (!response.ok) {

        localStorage.removeItem("dropbox-access-token");
        localStorage.removeItem("dropbox-refresh-token");
        localStorage.removeItem("dropbox-token-expires");

        throw new Error(
            await response.text()
        );

    }

    const data =
        await response.json();

    localStorage.setItem(

        "dropbox-access-token",

        data.access_token

    );

    localStorage.setItem(

        "dropbox-token-expires",

        (
            Date.now()
            +
            data.expires_in * 1000

        ).toString()

    );

}

export async function uploadBackup(
    notes: Note[]
) {

    const token = await getAccessToken();

    const json = JSON.stringify(
        notes,
        null,
        2
    );

    const now = new Date();

    const day =
        String(now.getDate()).padStart(2, "0");

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const year =
        String(now.getFullYear()).slice(-2);

    const hour =
        String(now.getHours()).padStart(2, "0");

    const minute =
        String(now.getMinutes()).padStart(2, "0");

    const filename =
        `FocusOS/${day}.${month}.${year}-${hour}:${minute} Dropbox.json`;

    const response = await fetch(

        "https://content.dropboxapi.com/2/files/upload",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${token}`,

                "Dropbox-API-Arg":

                    JSON.stringify({

                        path:
                            "/" + filename,

                        mode: "overwrite",

                        autorename: false,

                        mute: true

                    }),

                "Content-Type":
                    "application/octet-stream"

            },

            body: json

        }

    );

    const text = await response.text();

    if (!response.ok) {

        throw new Error(text);

    }

    return JSON.parse(text);
 

}

export async function deleteDropboxBackup(
    path: string
): Promise<boolean> {

    const token =
        await getAccessToken();

    const response = await fetch(

        "https://api.dropboxapi.com/2/files/delete_v2",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                path

            })

        }

    );

    if (response.ok) {

        return true;

    }

    const errorText =
        await response.text();

    try {

        const errorData =
            JSON.parse(errorText);

        if (

            errorData?.error_summary
                ?.startsWith(
                    "path_lookup/not_found"
                )

        ) {

            return true;

        }

    }

    catch {

        // keep normal error handling below

    }

    throw new Error(errorText);

}

export async function listBackups() {

    const token = await getAccessToken();

    const response = await fetch(

        "https://api.dropboxapi.com/2/files/list_folder",

        {

            method: "POST",

            headers: {

                Authorization: `Bearer ${token}`,

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                path: "/FocusOS"

            })

        }

    );

    if (!response.ok) {

        throw new Error(await response.text());

    }

    const data = await response.json();

    return data.entries
        .filter((file: any) =>
            file[".tag"] === "file"
        )
        .sort(

            (a: any, b: any) =>

                new Date(b.server_modified).getTime()

                -

                new Date(a.server_modified).getTime()

        );

}

export async function downloadBackup(

    path:string

){

    const token = await getAccessToken();

    const response = await fetch(

        "https://content.dropboxapi.com/2/files/download",

        {

            method:"POST",

            headers:{

                Authorization:`Bearer ${token}`,

                "Dropbox-API-Arg":

                    JSON.stringify({

                        path

                    })

            }

        }

    );

    if(!response.ok){

        throw new Error(

            await response.text()

        );

    }

    return await response.json();

}
 