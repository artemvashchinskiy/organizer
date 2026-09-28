import {
    useEffect,
    useState
} from "react";

import "./ActivityLog.scss";

import {
    getActivityLog
} from "../../services/activityServiceLog";

import type {
    ActivityProviderLog,
    BackupEntry,
    Provider
} from "../../types/activityTypeLog";


interface Props {

    open: boolean;

    onClose: () => void;

    onDeleteBackup: (
        entry: BackupEntry
    ) => Promise<void> | void;

    onGoogleDriveDeleteBackup: (
        entry: BackupEntry
    ) => Promise<void> | void;

    onOneDriveDeleteBackup: (
        entry: BackupEntry
    ) => Promise<void> | void;


    onRestoreBackup: (
        entry: BackupEntry
    ) => Promise<void> | void;

    onLocalRestoreBackup?: (
        entry: BackupEntry
    ) => Promise<void> | void;

    onGoogleDriveRestoreBackup?: (
        entry: BackupEntry
    ) => Promise<void> | void;

    onOneDriveRestoreBackup?: (
        entry: BackupEntry
    ) => Promise<void> | void;


    refreshKey: number;

    restoreMode?: boolean;

}


export default function ActivityLog({

    open,

    onClose,

    onDeleteBackup,

    onGoogleDriveDeleteBackup,

    onOneDriveDeleteBackup,

    onRestoreBackup,

    onLocalRestoreBackup,

    onGoogleDriveRestoreBackup,

    onOneDriveRestoreBackup,

    refreshKey,

    restoreMode = false

}: Props) {


    const [
        log,
        setLog
    ] = useState<ActivityProviderLog[]>(

        getActivityLog()

    );


    useEffect(() => {

        setLog(

            getActivityLog()

        );

    }, [

        open,

        refreshKey,

        restoreMode

    ]);


    if (!open) {

        return null;

    }


    /* --------------------------------
       RESTORE ROUTER
    -------------------------------- */

    async function handleRestoreBackup(

        provider: Provider,

        backup: BackupEntry

    ) {


        if (

            provider === "Local"

        ) {

            await onLocalRestoreBackup?.(

                backup

            );

            return;

        }


        if (

            provider === "Dropbox"

        ) {

            await onRestoreBackup(

                backup

            );

            return;

        }


        if (

            provider === "Google"

        ) {

            await onGoogleDriveRestoreBackup?.(

                backup

            );

            return;

        }


        if (

            provider === "OneDrive"

        ) {

            await onOneDriveRestoreBackup?.(

                backup

            );

            return;

        }

    }


    /* --------------------------------
       DELETE ROUTER
    -------------------------------- */

    async function handleDeleteBackup(

        provider: Provider,

        backup: BackupEntry

    ) {


        if (

            provider === "Dropbox"

        ) {

            await onDeleteBackup(

                backup

            );

            return;

        }


        if (

            provider === "Google"

        ) {

            await onGoogleDriveDeleteBackup(

                backup

            );

            return;

        }


        if (

            provider === "OneDrive"

        ) {

            await onOneDriveDeleteBackup(

                backup

            );

            return;

        }

    }


    return (

        <div className="activity-panel open">


            <div className="activity-header">


                <h3>

                    Activity Log

                </h3>


                <button

                    onClick={

                        onClose

                    }

                >

                    ✕

                </button>


            </div>


            <div className="activity-content">


                <div className="activity-table">


                    <div className="activity-head">


                        <div>

                            Provider

                        </div>


                        <div>

                            Backup

                        </div>


                        <div>

                            Restore

                        </div>


                    </div>


                    {

                        log

                            .filter(

                                provider =>

                                    provider.backup.length > 0

                                    ||

                                    provider.restore.length > 0

                            )

                            .sort(

                                (a, b) => {


                                    if (

                                        a.provider === "Local"

                                    ) {

                                        return -1;

                                    }


                                    if (

                                        b.provider === "Local"

                                    ) {

                                        return 1;

                                    }


                                    return 0;

                                }

                            )

                            .map(

                                provider => (

                                    <div

                                        key={

                                            provider.provider

                                        }

                                        className="activity-row"

                                    >


                                        <div className="provider-name">

                                            {

                                                provider.provider

                                            }

                                        </div>


                                        {/* BACKUPS */}

                                        <div className="activity-column">


                                            {

                                                provider.backup.length === 0

                                                    ?

                                                    <div className="empty">

                                                        —

                                                    </div>

                                                    :

                                                    provider.backup.map(

                                                        backup => (

                                                            <div

                                                                key={

                                                                    backup.id

                                                                }

                                                                className="activity-item"

                                                            >


                                                                <span>

                                                                    {

                                                                        backup.time

                                                                    }

                                                                </span>


                                                                {

                                                                    provider.provider !== "Local"

                                                                    &&

                                                                    <button

                                                                        className="delete-btn"

                                                                        onClick={() =>

                                                                            handleDeleteBackup(

                                                                                provider.provider,

                                                                                backup

                                                                            )

                                                                        }

                                                                    >

                                                                        🗑

                                                                    </button>

                                                                }


                                                            </div>

                                                        )

                                                    )

                                            }


                                        </div>


                                        {/* RESTORES */}

                                        <div className="activity-column">


                                            {

                                                provider.backup.length === 0

                                                    ?

                                                    <div className="empty">

                                                        —

                                                    </div>

                                                    :

                                                    provider.backup.map(

                                                        backup => {


                                                            const restoreEntry =

                                                                provider.restore.find(

                                                                    restore =>

                                                                        restore.path ===

                                                                        backup.path

                                                                );


                                                            return (

                                                                <div

                                                                    key={

                                                                        `restore-${backup.id}`

                                                                    }

                                                                    className="activity-item"

                                                                >


                                                                    {

                                                                        restoreMode

                                                                            ?

                                                                            <button

                                                                                className="restore-btn"

                                                                                onClick={() =>

                                                                                    handleRestoreBackup(

                                                                                        provider.provider,

                                                                                        backup

                                                                                    )

                                                                                }

                                                                            >

                                                                                {

                                                                                    restoreEntry

                                                                                        ?

                                                                                        restoreEntry.time

                                                                                        :

                                                                                        "Restore"

                                                                                }

                                                                            </button>

                                                                            :

                                                                            restoreEntry

                                                                                ?

                                                                                <span>

                                                                                    {

                                                                                        restoreEntry.time

                                                                                    }

                                                                                    {" ✓"}

                                                                                </span>

                                                                                :

                                                                                <span>

                                                                                    —

                                                                                </span>

                                                                    }


                                                                </div>

                                                            );

                                                        }

                                                    )

                                            }


                                        </div>


                                    </div>

                                )

                            )

                    }


                </div>


            </div>


        </div>

    );

}