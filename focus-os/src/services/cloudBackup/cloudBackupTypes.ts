import type {
    Note
} from "../../types/note";

import type {
    BackupEntry
} from "../../types/activityTypeLog";


export interface CloudBackupHandlers {

    onDropboxBackup:
        () => Promise<void>;

    onDropboxRestore:
        () => Promise<void>;

    onGoogleDriveBackup:
        () => Promise<void>;

    onGoogleDriveRestore:
        () => Promise<void>;

    onOneDriveBackup:
        () => Promise<void>;

    onOneDriveRestore:
        () => Promise<void>;

    onDeleteBackup:
        (entry: BackupEntry) => Promise<void>;

    onRestoreBackup:
        (entry: BackupEntry) => Promise<void>;

}


export type SetNotes =

    React.Dispatch<
        React.SetStateAction<
            Note[]
        >
    >;