import type {
    Dispatch,
    SetStateAction
} from "react";

import type { Note } from "../types/note";
import type { BackupEntry } from "../types/activityTypeLog";

import {
    listBackups,
    downloadBackup,
    uploadBackup,
    deleteDropboxBackup
} from "../services/dropboxService";

import {
    mergeImportedNotes
} from "../services/storageService";

import {
    addActivity,
    removeBackupActivity
} from "../services/activityServiceLog";


interface UseDropboxBackupProps {

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


function useDropboxBackup({
    notes,
    setNotes,
    setActivityVersion,
    setRestoreMode,
    setActivityOpen
}: UseDropboxBackupProps) {


    async function onDropboxBackup() {

        try {

            const result =
                await uploadBackup(notes);

            addActivity(
                "Dropbox",
                "backup",
                result.path_display
            );

            setActivityVersion(
                value => value + 1
            );

            setActivityOpen(true);

            setTimeout(() => {

                setActivityOpen(false);

                setRestoreMode(false);

            }, 5500);

        }

        catch (error) {

            console.error(error);

        }

    }


    async function onDropboxRestore() {

        try {

            const files =
                await listBackups();

            if (files.length === 0) {

                throw new Error(
                    "No Dropbox backups found."
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
                "Dropbox restore failed:",
                error
            );

        }

    }


    async function handleRestoreBackup(
        entry: BackupEntry
    ) {

        try {

            const imported =
                await downloadBackup(
                    entry.path
                );

            if (!Array.isArray(imported)) {

                throw new Error(
                    "Invalid Dropbox backup format."
                );

            }

            setNotes(prev =>
                mergeImportedNotes(
                    prev,
                    imported
                )
            );

            addActivity(
                "Dropbox",
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
                "Dropbox restore failed:",
                error
            );

        }

    }


    async function handleDeleteBackup(
        entry: BackupEntry
    ) {

        if (!entry.path) {

            return;

        }

        try {

            await deleteDropboxBackup(
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

            console.error(error);

        }

    }


    return {

        onDropboxBackup,

        onDropboxRestore,

        handleRestoreBackup,

        handleDeleteBackup

    };

}


export default useDropboxBackup;