import type { FocusLicense } from "./licenseService";
import { getLicense, installLicense } from "./licenseService";

export interface FocusOSBackup {
    version: 3;
    createdAt: number;
    calendarNotes: unknown[];
    freeNotes: unknown[];
    matrixTasks: unknown[];
    expenses: unknown[];
    license: FocusLicense | null;
}

function readArray(key: string): unknown[] {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const value = JSON.parse(raw);
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function getCurrentUserId(): string | null {
    try {
        const raw = localStorage.getItem("calendar-session");
        if (!raw) return null;
        const session = JSON.parse(raw) as { userId?: string };
        return session.userId ?? null;
    } catch {
        return null;
    }
}

export function createFocusOSBackup(calendarNotes: unknown[]): FocusOSBackup {
    const userId = getCurrentUserId();

    return {
        version: 3,
        createdAt: Date.now(),
        calendarNotes: Array.isArray(calendarNotes) ? calendarNotes : [],
        freeNotes: userId ? readArray(`free-notes-${userId}`) : [],
        matrixTasks: userId ? readArray(`focus-matrix-${userId}`) : [],
        expenses: userId ? readArray(`focus-expenses-${userId}`) : [],
        license: userId ? getLicense(userId) : null
    };
}

export function isFocusOSBackup(value: unknown): value is FocusOSBackup {
    if (!value || typeof value !== "object") return false;

    const backup = value as Partial<FocusOSBackup>;

    return (
        (backup.version === 3 || backup.version === 2) &&
        Array.isArray(backup.calendarNotes) &&
        Array.isArray(backup.freeNotes) &&
        Array.isArray(backup.matrixTasks) &&
        Array.isArray(backup.expenses)
    );
}

export function getCalendarNotesFromBackup(value: unknown): unknown[] {
    if (isFocusOSBackup(value)) {
        return value.calendarNotes;
    }

    return Array.isArray(value) ? value : [];
}

export function restoreFocusOSBackup(value: unknown): void {
    const userId = getCurrentUserId();

    if (!userId) {
        throw new Error("No active Focus OS session.");
    }

    localStorage.setItem(
        `calendar-notes-${userId}`,
        JSON.stringify(getCalendarNotesFromBackup(value))
    );

    if (isFocusOSBackup(value)) {
        const backup = value as FocusOSBackup & {
            license?: FocusLicense | null;
        };

        localStorage.setItem(
            `free-notes-${userId}`,
            JSON.stringify(backup.freeNotes)
        );

        localStorage.setItem(
            `focus-matrix-${userId}`,
            JSON.stringify(backup.matrixTasks)
        );

        localStorage.setItem(
            `focus-expenses-${userId}`,
            JSON.stringify(backup.expenses)
        );

        /*
         * License restore is only accepted when the backup contains
         * a valid key. Expiry dates are preserved from the backup.
         */
        if (
            backup.version === 3 &&
            backup.license &&
            backup.license.key
        ) {
            try {
                installLicense(
                    userId,
                    backup.license.key,
                    backup.license.issuedAt
                );

                const restored = getLicense(userId);

                if (restored) {
                    localStorage.setItem(
                        `focus-license-${userId}`,
                        JSON.stringify({
                            ...restored,
                            expiresAt: backup.license.expiresAt
                        })
                    );
                }
            } catch {
                // Never let an invalid license block data restoration.
            }
        }
    }

    window.location.reload();
}
