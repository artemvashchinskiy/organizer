import type {

    Dispatch,

    SetStateAction

} from "react";


import type {

    Note

} from "../types/note";


import type {

    BackupEntry

} from "../types/activityTypeLog";


import {

    backupToOneDriveCloud,

    checkOneDriveBackups,

    restoreOneDriveBackup,

    deleteOneDriveBackupEntry

} from "../services/cloudBackup/oneDriveBackupService";


interface UseOneDriveBackupProps {

    notes: Note[];

    setNotes:
        Dispatch<
            SetStateAction<Note[]>
        >;

    setActivityVersion:
        Dispatch<
            SetStateAction<number>
        >;

    setRestoreMode:
        Dispatch<
            SetStateAction<boolean>
        >;

    setActivityOpen:
        Dispatch<
            SetStateAction<boolean>
        >;

}


export default function useOneDriveBackup({

    notes,

    setNotes,

    setActivityVersion,

    setRestoreMode,

    setActivityOpen

}: UseOneDriveBackupProps) {


    async function onOneDriveBackup() {

        try {

            await backupToOneDriveCloud(

                notes

            );


            setActivityVersion(

                value => value + 1

            );


            setRestoreMode(

                false

            );


            setActivityOpen(

                true

            );


            setTimeout(() => {

                setActivityOpen(

                    false

                );


                setRestoreMode(

                    false

                );

            }, 5500);

        }

        catch (error) {

            console.error(

                "OneDrive backup failed:",

                error

            );

        }

    }


    async function onOneDriveRestore() {

        try {

            await checkOneDriveBackups();


            setRestoreMode(

                true

            );


            setActivityOpen(

                true

            );


            setActivityVersion(

                value => value + 1

            );

        }

        catch (error) {

            console.error(

                "OneDrive restore failed:",

                error

            );

        }

    }


    async function handleOneDriveRestoreBackup(

        entry: BackupEntry

    ) {

        try {

            const restoredNotes =

                await restoreOneDriveBackup(

                    entry,

                    notes

                );


            setNotes(

                restoredNotes

            );


            setActivityVersion(

                value => value + 1

            );


            setTimeout(() => {

                setActivityOpen(

                    false

                );


                setRestoreMode(

                    false

                );

            }, 5500);

        }

        catch (error) {

            console.error(

                "OneDrive restore failed:",

                error

            );

        }

    }


    async function handleOneDriveDeleteBackup(

        entry: BackupEntry

    ) {

        try {

            await deleteOneDriveBackupEntry(

                entry

            );


            setActivityVersion(

                value => value + 1

            );

        }

        catch (error) {

            console.error(

                "OneDrive backup delete failed:",

                error

            );

        }

    }


    return {

        onOneDriveBackup,

        onOneDriveRestore,

        handleOneDriveRestoreBackup,

        handleOneDriveDeleteBackup

    };

}