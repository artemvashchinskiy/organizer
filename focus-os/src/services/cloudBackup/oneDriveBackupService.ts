import type {

    Note

} from "../../types/note";


import type {

    BackupEntry

} from "../../types/activityTypeLog";


import {

    getOneDriveConnection

} from "../oneDriveService";


import {

    listOneDriveBackups,

    uploadOneDriveBackup,

    downloadOneDriveBackup,

    deleteOneDriveBackup

} from "../oneDriveApi";


import {

    createExportFilename,

    mergeImportedNotes

} from "../storageService";


import {

    addActivity,

    removeBackupActivity

} from "../activityServiceLog";


function requireOneDriveConnection() {

    const connection =

        getOneDriveConnection();


    if (

        !connection

    ) {

        throw new Error(

            "OneDrive is not connected."

        );

    }


    return connection;

}


export async function backupToOneDriveCloud(

    notes: Note[]

) {

    const connection =

        requireOneDriveConnection();


    const filename =

        createExportFilename();


    const result =

        await uploadOneDriveBackup(

            connection.accessToken,

            filename,

            notes

        );


    addActivity(

        "OneDrive",

        "backup",

        result.id

    );


    return result;

}


export async function checkOneDriveBackups() {

    const connection =

        requireOneDriveConnection();


    const files =

        await listOneDriveBackups(

            connection.accessToken

        );


    if (

        files.length === 0

    ) {

        throw new Error(

            "No OneDrive backups found."

        );

    }


    return files;

}


export async function restoreOneDriveBackup(

    entry: BackupEntry,

    currentNotes: Note[]

) {

    const connection =

        requireOneDriveConnection();


    const imported =

        await downloadOneDriveBackup(

            connection.accessToken,

            entry.path

        );


    if (

        !Array.isArray(

            imported

        )

    ) {

        throw new Error(

            "Invalid OneDrive backup format."

        );

    }


    const merged =

        mergeImportedNotes(

            currentNotes,

            imported

        );


    addActivity(

        "OneDrive",

        "restore",

        entry.path

    );


    return merged;

}


export async function deleteOneDriveBackupEntry(

    entry: BackupEntry

) {

    if (

        !entry.path

    ) {

        return;

    }


    const connection =

        requireOneDriveConnection();


    await deleteOneDriveBackup(

        connection.accessToken,

        entry.path

    );


    removeBackupActivity(

        entry.path

    );

}