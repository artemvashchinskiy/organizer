import type {
    Dispatch,
    SetStateAction
} from "react";

import type { Note } from "../types/note";
import type { BackupEntry } from "../types/activityTypeLog";

import {
    getGoogleDriveConnection
} from "../services/googleDriveService";

import {
    listGoogleDriveBackups,
    uploadGoogleDriveBackup,
    downloadGoogleDriveBackup,
    deleteGoogleDriveBackup
} from "../services/googleDriveApi";

import {
    createExportFilename,
    mergeImportedNotes
} from "../services/storageService";

import {
    addActivity,
    removeBackupActivity
} from "../services/activityServiceLog";


interface UseGoogleDriveBackupProps {

    notes: Note[];

    setNotes:
        Dispatch<SetStateAction<Note[]>>;

    setActivityVersion:
        Dispatch<SetStateAction<number>>;

    setRestoreMode:
        Dispatch<SetStateAction<boolean>>;

    setActivityOpen:
        Dispatch<SetStateAction<boolean>>;
}


function useGoogleDriveBackup({
    notes,
    setNotes,
    setActivityVersion,
    setRestoreMode,
    setActivityOpen
}: UseGoogleDriveBackupProps) {


    async function onGoogleDriveBackup() {

        try {

            const connection =
                getGoogleDriveConnection();

            if (!connection) {

                throw new Error(
                    "Google Drive is not connected."
                );

            }

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

            setActivityVersion(
                value => value + 1
            );

            setRestoreMode(false);

            setActivityOpen(true);

            setTimeout(() => {

                setActivityOpen(false);

                setRestoreMode(false);

            }, 5500);

        }

        catch (error) {

            console.error(
                "Google Drive backup failed:",
                error
            );

        }

    }


    async function onGoogleDriveRestore() {

        try {

            const connection =
                getGoogleDriveConnection();

            if (!connection) {

                throw new Error(
                    "Google Drive is not connected."
                );

            }

            const files =
                await listGoogleDriveBackups(
                    connection.accessToken
                );

            if (files.length === 0) {

                throw new Error(
                    "No Google Drive backups found."
                );

            }

            setRestoreMode(true);

            setActivityOpen(true);

            setActivityVersion(
                value => value + 1
            );

        }

        catch (error) {

            console.error(
                "Google Drive restore failed:",
                error
            );

        }

    }


    async function handleGoogleDriveRestoreBackup(
        entry: BackupEntry
    ) {

        try {

            const connection =
                getGoogleDriveConnection();

            if (!connection) {

                throw new Error(
                    "Google Drive is not connected."
                );

            }

            const imported =
                await downloadGoogleDriveBackup(
                    connection.accessToken,
                    entry.path
                );

            if (!Array.isArray(imported)) {

                throw new Error(
                    "Invalid Google Drive backup format."
                );

            }

            setNotes(prev =>
                mergeImportedNotes(
                    prev,
                    imported
                )
            );

            addActivity(
                "Google",
                "restore",
                entry.path
            );

            setActivityVersion(
                value => value + 1
            );

            setTimeout(() => {

                setActivityOpen(false);

                setRestoreMode(false);

            }, 5500);

        }

        catch (error) {

            console.error(
                "Google Drive restore failed:",
                error
            );

        }

    }


    async function handleGoogleDriveDeleteBackup(
        entry: BackupEntry
    ) {

        if (!entry.path) {

            return;

        }

        try {

            const connection =
                getGoogleDriveConnection();

            if (!connection) {

                throw new Error(
                    "Google Drive is not connected."
                );

            }

            await deleteGoogleDriveBackup(
                connection.accessToken,
                entry.path
            );

            removeBackupActivity(
                entry.path
            );

            setActivityVersion(
                value => value + 1
            );

        }

        catch (error) {

            console.error(
                "Google Drive backup delete failed:",
                error
            );

        }

    }


    return {

        onGoogleDriveBackup,

        onGoogleDriveRestore,

        handleGoogleDriveRestoreBackup,

        handleGoogleDriveDeleteBackup

    };

}


export default useGoogleDriveBackup;