// activityServiceLog.ts
import type {

    ActivityProviderLog,

    Provider,

    BackupEntry

} from "../types/activityTypeLog";

import {

    formatActivityDate

} from "./activityFormat";


const STORAGE_KEY = "activity-log";


export function getActivityLog(): ActivityProviderLog[] {

    const json =
        localStorage.getItem(STORAGE_KEY);

    if (!json) {

        return [];

    }

    try {

        const parsed =
            JSON.parse(json);

        if (!Array.isArray(parsed)) {

            return [];

        }

        return parsed.map(

            (item: ActivityProviderLog) => ({

                provider: item.provider,

                backup: Array.isArray(item.backup)

                    ? item.backup.map(

                        (entry: BackupEntry | number) =>

                            typeof entry === "number"

                                ? {

                                    id: entry,

                                    time: formatActivityDate(entry),

                                    path: ""

                                }

                                : entry

                    )

                    : [],

                restore: Array.isArray(item.restore)

                    ? item.restore.map(

                        (entry: BackupEntry | number) =>

                            typeof entry === "number"

                                ? {

                                    id: entry,

                                    time: formatActivityDate(entry),

                                    path: ""

                                }

                                : entry

                    )

                    : []

            })

        );

    }

    catch {

        return [];

    }

}


export function addActivity(

    provider: Provider,

    action: "backup" | "restore",

    path: string = ""

) {

    const log =
        getActivityLog();


    let providerLog =
        log.find(

            item =>
                item.provider === provider

        );


    if (!providerLog) {

        providerLog = {

            provider,

            backup: [],

            restore: []

        };

        log.push(providerLog);

    }


    const now = Date.now();


    // --------------------------------
    // BACKUP
    // --------------------------------

    if (action === "backup") {

        const entry: BackupEntry = {

            id: now,

            time: formatActivityDate(now),

            path

        };


        providerLog.backup.unshift(entry);

        providerLog.backup =
            providerLog.backup.slice(0, 10);

    }


    // --------------------------------
    // RESTORE
    // --------------------------------

    // RESTORE

    else {

        const existingRestore =
            providerLog.restore.find(
                entry =>
                    entry.path === path
            );


        if (existingRestore) {

            existingRestore.id = now;

            existingRestore.time =
                formatActivityDate(now);

        }

        else {

            providerLog.restore.unshift({

                id: now,

                time:
                    formatActivityDate(now),

                path

            });

        }


        providerLog.restore =
            providerLog.restore.slice(0, 10);

    }


    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(log)

    );

}



export function removeBackupActivity(
    path: string
) {

    const log =
        getActivityLog();


    const updated =
        log.map(provider => ({

            ...provider,

            backup:
                provider.backup.filter(

                    entry =>
                        entry.path !== path

                ),

            restore:
                provider.restore.filter(

                    entry =>
                        entry.path !== path

                )

        }));


    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(updated)

    );

}