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

                    Authorization:
                        `Bearer ${accessToken}`,

                    ...(options.headers || {})

                }

            }

        );


    if (!response.ok) {

        const text =

            await response.text();


        throw new Error(

            `Microsoft Graph API error ${response.status}: ${text}`

        );

    }


    if (

        response.status === 204

    ) {

        return undefined as T;

    }


    return response.json();

}


/* --------------------------------
   FIND FOCUSOS FOLDER
-------------------------------- */

export async function findOneDriveFocusOSFolder(

    accessToken: string

): Promise<OneDriveDriveItem | null> {

    const data =

        await graphFetch<{

            value: OneDriveDriveItem[];

        }>(

            `${GRAPH_API}/me/drive/root/children` +
            `?$select=id,name,folder,createdDateTime,lastModifiedDateTime`

            ,

            accessToken

        );


    const folder =

        data.value.find(

            item =>

                item.name === FOLDER_NAME

                &&

                item.folder

        );


    return folder || null;

}


/* --------------------------------
   CREATE FOCUSOS FOLDER
-------------------------------- */

export async function createOneDriveFocusOSFolder(

    accessToken: string

): Promise<OneDriveDriveItem> {

    return graphFetch<OneDriveDriveItem>(

        `${GRAPH_API}/me/drive/root/children`,

        accessToken,

        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

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

    const existing =

        await findOneDriveFocusOSFolder(

            accessToken

        );


    if (existing) {

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


    const data =

        await graphFetch<{

            value: OneDriveDriveItem[];

        }>(

            `${GRAPH_API}/me/drive/items/${folder.id}/children` +
            `?$select=id,name,size,file,createdDateTime,lastModifiedDateTime` +
            `&$orderby=createdDateTime desc`,

            accessToken

        );


    return data.value.filter(

        item =>

            item.file

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

    const folder =

        await getOneDriveFocusOSFolder(

            accessToken

        );


    const response =

        await fetch(

            `${GRAPH_API}/me/drive/items/${folder.id}:/${encodeURIComponent(filename)}:/content`,

            {

                method: "PUT",

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`,

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(

                    notes

                )

            }

        );


    if (!response.ok) {

        const text =

            await response.text();


        throw new Error(

            `OneDrive upload failed: ${response.status}: ${text}`

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

    const response =

        await fetch(

            `${GRAPH_API}/me/drive/items/${fileId}/content`,

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

            `OneDrive download failed: ${response.status}: ${text}`

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

    const response =

        await fetch(

            `${GRAPH_API}/me/drive/items/${fileId}`,

            {

                method: "DELETE",

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

            `OneDrive delete failed: ${response.status}: ${text}`

        );

    }

}