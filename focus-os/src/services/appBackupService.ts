export interface FocusOSBackup {
    version: 2;
    createdAt: number;
    calendarNotes: unknown[];
    freeNotes: unknown[];
    matrixTasks: unknown[];
    expenses: unknown[];
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
        version: 2,
        createdAt: Date.now(),
        calendarNotes: Array.isArray(calendarNotes) ? calendarNotes : [],
        freeNotes: userId ? readArray(`free-notes-${userId}`) : [],
        matrixTasks: userId ? readArray(`focus-matrix-${userId}`) : [],
        expenses: userId ? readArray(`focus-expenses-${userId}`) : []
    };
}

export function isFocusOSBackup(value: unknown): value is FocusOSBackup {
    if (!value || typeof value !== "object") return false;
    const backup = value as Partial<FocusOSBackup>;
    return backup.version === 2
        && Array.isArray(backup.calendarNotes)
        && Array.isArray(backup.freeNotes)
        && Array.isArray(backup.matrixTasks)
        && Array.isArray(backup.expenses);
}

export function getCalendarNotesFromBackup(value: unknown): unknown[] {
    if (isFocusOSBackup(value)) return value.calendarNotes;
    return Array.isArray(value) ? value : [];
}

export function restoreFocusOSBackup(value: unknown): void {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("No active Focus OS session.");

    localStorage.setItem(
        `calendar-notes-${userId}`,
        JSON.stringify(getCalendarNotesFromBackup(value))
    );

    if (isFocusOSBackup(value)) {
        localStorage.setItem(`free-notes-${userId}`, JSON.stringify(value.freeNotes));
        localStorage.setItem(`focus-matrix-${userId}`, JSON.stringify(value.matrixTasks));
        localStorage.setItem(`focus-expenses-${userId}`, JSON.stringify(value.expenses));
    }

    window.location.reload();
}
