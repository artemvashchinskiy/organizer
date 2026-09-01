import type {

    Note

} from "../../types/note";


import type {

    BackupEntry

} from "../../types/activityTypeLog";


import {

    getGoogleDriveConnection

} from "../googleDriveService";


import {

    listGoogleDriveBackups,

    uploadGoogleDriveBackup,

    downloadGoogleDriveBackup,

    deleteGoogleDriveBackup

} from "../googleDriveApi";


import {

    createExportFilename,

    mergeImportedNotes

} from "../storageService";


import {

    addActivity,

    removeBackupActivity

} from "../activityServiceLog";


function requireGoogleConnection() {

    const connection =

        getGoogleDriveConnection();


    if (

        !connection

    ) {

        throw new Error(

            "Google Drive is not connected."

        );

    }


    return connection;

}


export async function backupToGoogleDrive(

    notes: Note[]

) {

    const connection =

        requireGoogleConnection();


    const filename =

        createExportFilename();


    const result =

        await uploadGoogleDriveBackup(

            connection.accessToken,

            filename,

            notes

        );


    addActivity(

        "Google",

        "backup",

        result.id

    );


    return result;

}


export async function checkGoogleDriveBackups() {

    const connection =

        requireGoogleConnection();


    const files =

        await listGoogleDriveBackups(

            connection.accessToken

        );


    if (

        files.length === 0

    ) {

        throw new Error(

            "No Google Drive backups found."

        );

    }


    return files;

}


export async function restoreGoogleDriveBackup(

    entry: BackupEntry,

    currentNotes: Note[]

) {

    const connection =

        requireGoogleConnection();


    const imported =

        await downloadGoogleDriveBackup(

            connection.accessToken,

            entry.path

        );


    if (

        !Array.isArray(

            imported

        )

    ) {

        throw new Error(

            "Invalid Google Drive backup format."

        );

    }


    const merged =

        mergeImportedNotes(

            currentNotes,

            imported

        );


    addActivity(

        "Google",

        "restore",

        entry.path

    );


    return merged;

}


export async function deleteGoogleDriveBackupEntry(

    entry: BackupEntry

) {

    if (

        !entry.path

    ) {

        return;

    }


    const connection =

        requireGoogleConnection();


    await deleteGoogleDriveBackup(

        connection.accessToken,

        entry.path

    );


    removeBackupActivity(

        entry.path

    );

}