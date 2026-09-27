import type {
    OneDriveDriveItem
} from "../types/oneDrive";


const GRAPH_API =
    "https://graph.microsoft.com/v1.0";


const FOLDER_NAME =
    "FocusOS";


async function graphFetch<T>(
    url: string,
    accessToken: string,
    options: RequestInit = {}
): Promise<T> {

    const response =
        await fetch(
            url,
            {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization:
                        `Bearer ${accessToken}`
                }
            }
        );


    if (!response.ok) {

        const text =
            await response.text();


        throw new Error(
            `Microsoft Graph API error ` +
            `${response.status}: ${text}`
        );

    }


    if (
        response.status === 204
        ||
        response.status === 205
    ) {

        return undefined as T;

    }


    return response.json();

}


/* --------------------------------
   GET CURRENT DRIVE
-------------------------------- */

async function getOneDriveId(
    accessToken: string
): Promise<string> {

    const drive =
        await graphFetch<{
            id: string;
        }>(
            `${GRAPH_API}/me/drive`,
            accessToken
        );


    if (!drive.id) {

        throw new Error(
            "OneDrive drive ID was not returned."
        );

    }


    console.log(
        "OneDrive drive ID:",
        drive.id
    );


    return drive.id;

}


/* --------------------------------
   FIND FOCUSOS FOLDER
-------------------------------- */

export async function findOneDriveFocusOSFolder(

    accessToken: string

): Promise<OneDriveDriveItem | null> {

    const driveId =
        await getOneDriveId(
            accessToken
        );


    const data =
        await graphFetch<{
            value: OneDriveDriveItem[];
        }>(
            `${GRAPH_API}/drives/` +
            `${encodeURIComponent(driveId)}` +
            `/root/children` +
            `?$select=id,name,folder,parentReference,driveItemReference,remoteItem,webUrl,createdDateTime,lastModifiedDateTime`,
            accessToken
        );


    const folder =
        data.value.find(
            item =>
                item.name === FOLDER_NAME
                &&
                !!item.folder
        );


    console.log(
        "FocusOS folder returned by Graph:",
        folder
    );
    console.log(
        "FocusOS folder metadata:",
        folder
    );


    return folder || null;

}


/* --------------------------------
   CREATE FOCUSOS FOLDER
-------------------------------- */

export async function createOneDriveFocusOSFolder(

    accessToken: string

): Promise<OneDriveDriveItem> {

    const driveId =
        await getOneDriveId(
            accessToken
        );


    return graphFetch<OneDriveDriveItem>(

        `${GRAPH_API}/drives/` +
        `${encodeURIComponent(driveId)}` +
        `/root/children`,

        accessToken,

        {

            method:
                "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify({

                    name:
                        FOLDER_NAME,

                    folder:
                        {},

                    "@microsoft.graph.conflictBehavior":
                        "fail"

                })

        }

    );

}


/* --------------------------------
   GET OR CREATE FOLDER
-------------------------------- */

export async function getOneDriveFocusOSFolder(
    accessToken: string
): Promise<OneDriveDriveItem> {

    const driveId =
        await getOneDriveId(
            accessToken
        );

    const data =
        await graphFetch<{
            value: OneDriveDriveItem[];
        }>(
            `${GRAPH_API}/drives/` +
            `${encodeURIComponent(driveId)}` +
            `/root/children` +
            `?$select=id,name,folder,createdDateTime,lastModifiedDateTime`,
            accessToken
        );

    const existing =
        data.value.find(
            item =>
                item.name === FOLDER_NAME
                &&
                !!item.folder
        );

    if (existing) {
        console.log(
            "FocusOS folder returned by Graph:",
            existing
        );

        return existing;
    }

    return createOneDriveFocusOSFolder(
        accessToken
    );
}


/* --------------------------------
   LIST BACKUPS
-------------------------------- */

export async function listOneDriveBackups(
    accessToken: string
): Promise<OneDriveDriveItem[]> {

    const folder =
        await getOneDriveFocusOSFolder(
            accessToken
        );

    console.log(
        "FocusOS folder used for restore:",
        folder
    );

    const driveId =
        await getOneDriveId(
            accessToken
        );

    console.log(
        "Drive ID used for restore:",
        driveId
    );

    const data =
        await graphFetch<{
            value: OneDriveDriveItem[];
        }>(
            `${GRAPH_API}/drives/` +
            `${encodeURIComponent(driveId)}` +
            `/items/` +
            `${encodeURIComponent(folder.id)}` +
            `/children`,
            accessToken
        );

    console.log(
        "FocusOS children returned by Graph:",
        data
    );

    return data.value.filter(
        item =>
            !!item.file
    );
}


/* --------------------------------
   UPLOAD BACKUP
-------------------------------- */

export async function uploadOneDriveBackup(

    accessToken: string,

    filename: string,

    notes: unknown

): Promise<OneDriveDriveItem> {

    const payload =
        JSON.stringify(notes);


    if (
        typeof payload !== "string"
        ||
        payload.length === 0
    ) {

        throw new Error(
            "OneDrive upload failed: backup payload is empty."
        );

    }


    const folder =
        await getOneDriveFocusOSFolder(
            accessToken
        );


    const driveId =
        await getOneDriveId(
            accessToken
        );


    console.log(
        "Uploading OneDrive backup:",
        {
            driveId,
            folderId:
                folder.id,
            filename,
            payloadLength:
                payload.length
        }
    );


    const response =
        await fetch(

            `${GRAPH_API}/drives/` +
            `${encodeURIComponent(driveId)}` +
            `/root:/FocusOS/` +
            `${encodeURIComponent(filename)}` +
            `:/content`,

            {

                method:
                    "PUT",

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`,

                    "Content-Type":
                        "application/json"

                },

                body:
                    new Blob(
                        [payload],
                        {
                            type:
                                "application/json"
                        }
                    )

            }

        );


    if (!response.ok) {

        const text =
            await response.text();


        throw new Error(
            `OneDrive upload failed: ` +
            `${response.status}: ${text}`
        );

    }


    return response.json();

}


/* --------------------------------
   DOWNLOAD BACKUP
-------------------------------- */

export async function downloadOneDriveBackup(

    accessToken: string,

    fileId: string

): Promise<unknown> {

    const driveId =
        await getOneDriveId(
            accessToken
        );


    const response =
        await fetch(

            `${GRAPH_API}/drives/` +
            `${encodeURIComponent(driveId)}` +
            `/items/` +
            `${encodeURIComponent(fileId)}` +
            `/content`,

            {

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }

        );


    if (!response.ok) {

        const text =
            await response.text();


        throw new Error(

            `OneDrive download failed: ` +
            `${response.status}: ${text}`

        );

    }


    return response.json();

}


/* --------------------------------
   DELETE BACKUP
-------------------------------- */

export async function deleteOneDriveBackup(

    accessToken: string,

    fileId: string

): Promise<void> {

    const driveId =
        await getOneDriveId(
            accessToken
        );


    const response =
        await fetch(

            `${GRAPH_API}/drives/` +
            `${encodeURIComponent(driveId)}` +
            `/items/` +
            `${encodeURIComponent(fileId)}`,

            {

                method:
                    "DELETE",

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }

        );


    if (
        !response.ok
        &&
        response.status !== 204
    ) {

        const text =
            await response.text();


        throw new Error(

            `OneDrive delete failed: ` +
            `${response.status}: ${text}`

        );

    }

}