import type {
    Note
} from "../../types/note";


import {

    listBackups,

    uploadBackup,

    downloadBackup,

    deleteDropboxBackup

} from "../dropboxService";


import {

    addActivity,

    removeBackupActivity

} from "../activityServiceLog";


import {

    mergeImportedNotes

} from "../storageService";


import type {

    BackupEntry

} from "../../types/activityTypeLog";


export async function backupToDropbox(

    notes: Note[]

) {

    const result =

        await uploadBackup(
            notes
        );


    addActivity(

        "Dropbox",

        "backup",

        result.path_display

    );


    return result;

}


export async function checkDropboxBackups() {

    const files =

        await listBackups();


    if (

        files.length === 0

    ) {

        throw new Error(

            "No Dropbox backups found."

        );

    }


    return files;

}


export async function restoreDropboxBackup(

    entry: BackupEntry,

    currentNotes: Note[]

) {

    const imported =

        await downloadBackup(

            entry.path

        );


    if (

        !Array.isArray(

            imported

        )

    ) {

        throw new Error(

            "Invalid Dropbox backup format."

        );

    }


    const merged =

        mergeImportedNotes(

            currentNotes,

            imported

        );


    addActivity(

        "Dropbox",

        "restore",

        entry.path

    );


    return merged;

}


export async function deleteDropboxBackupEntry(

    entry: BackupEntry

) {

    if (

        !entry.path

    ) {

        return;

    }


    await deleteDropboxBackup(

        entry.path

    );


    removeBackupActivity(

        entry.path

    );

}