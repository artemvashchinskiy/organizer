// ActivityLog.tsx
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
    BackupEntry
} from "../../types/activityTypeLog";


interface Props {

    open: boolean;

    onClose: () => void;

    onDeleteBackup: (entry: BackupEntry) => void;

    onGoogleDriveDeleteBackup: (entry: BackupEntry) => void;

    onRestoreBackup: (entry: BackupEntry) => void;

    onLocalRestoreBackup?: (entry: BackupEntry) => void;

    onGoogleDriveRestoreBackup?: (entry: BackupEntry) => void;

    onOneDriveRestoreBackup:
        (entry: BackupEntry) => Promise<void>;

    onOneDriveDeleteBackup:
        (entry: BackupEntry) => Promise<void>;

    refreshKey: number;

    restoreMode?: boolean;

}


export default function ActivityLog({

    open,

    onClose,

    onDeleteBackup,

    onGoogleDriveDeleteBackup,

    onRestoreBackup,

    onLocalRestoreBackup,

    onGoogleDriveRestoreBackup,

    onOneDriveDeleteBackup,

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


    return (

        <div className="activity-panel open">

            <div className="activity-header">

                <h3>
                    Activity Log
                </h3>

                <button
                    onClick={onClose}
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
                            .filter(provider =>
                                provider.backup.length > 0 ||
                                provider.restore.length > 0
                            )
                            .sort((a, b) => {

                                if (a.provider === "Local") return -1;

                                if (b.provider === "Local") return 1;

                                return 0;

                            })
                            .map(provider => (

                                <div
                                    key={provider.provider}
                                    className="activity-row"
                                >


                                    <div className="provider-name">

                                        {provider.provider}

                                    </div>


                                    {/* BACKUP COLUMN */}

                                    <div className="activity-column">

                                        {

                                            provider.backup.length === 0

                                                ?

                                                <div className="empty">
                                                    —
                                                </div>

                                                :

                                                provider.backup.map(
                                                    (item: BackupEntry) => (

                                                        <div
                                                            key={item.id}
                                                            className="activity-item"
                                                        >

                                                            <span>
                                                                {item.time}
                                                            </span>


                                                            {
                                                                provider.provider === "Dropbox"
                                                                    &&
                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={() =>
                                                                            onDeleteBackup(item)
                                                                        }
                                                                    >
                                                                        🗑
                                                                    </button>
                                                            }

                                                            {
                                                                provider.provider === "Google"
                                                                    &&
                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={() =>
                                                                            onGoogleDriveDeleteBackup(item)
                                                                        }
                                                                    >
                                                                        🗑
                                                                    </button>
                                                            }

                                                            {
                                                                provider.provider === "OneDrive"
                                                                    &&
                                                                    <button

                                                                        className="delete-btn"

                                                                        onClick={() =>

                                                                            onOneDriveDeleteBackup?.(

                                                                                item

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


                                    {/* RESTORE COLUMN */} 

                                    <div className="activity-column">

                                        {
                                            provider.backup.length === 0

                                                ?

                                                <div className="empty">
                                                    —
                                                </div>

                                                :

                                                provider.backup.map(
                                                    (backup: BackupEntry) => {

                                                        const restoreEntry =
                                                            provider.restore.find(
                                                                restore =>
                                                                    restore.path === backup.path
                                                            );

                                                        return (

                                                            <div
                                                                key={`restore-${backup.id}`}
                                                                className="activity-item"
                                                            >

                                                                {
                                                                    restoreMode

                                                                        ?

                                                                        <button
                                                                            className="restore-btn"
                                                                            onClick={() => {

                                                                                if (provider.provider === "Local") {

                                                                                    onLocalRestoreBackup?.(backup);

                                                                                }

                                                                                else if (provider.provider === "Dropbox") {

                                                                                    onRestoreBackup(backup);

                                                                                }

                                                                                else if (provider.provider === "Google") {

                                                                                    onGoogleDriveRestoreBackup?.(backup);

                                                                                }

                                                                                else if (

                                                                                    provider.provider === "OneDrive"

                                                                                ) {

                                                                                    onOneDriveRestoreBackup?.(

                                                                                        backup

                                                                                    );

                                                                                }


                                                                                else{

                                                                                    onRestoreBackup(backup);

                                                                                }

                                                                            }}
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
                                                                                {restoreEntry.time} ✓
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

                            ))

                    }


                </div>

            </div>

        </div>

    );

} 
