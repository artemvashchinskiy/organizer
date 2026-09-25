export interface FocusTrial {
    startedAt: number;
    expiresAt: number;
}

const TRIAL_DAYS = 15;
const DAY = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = "focus-trial-";

function storageKey(userId: string): string {
    return STORAGE_PREFIX + userId;
}

export function getTrial(userId: string, now = Date.now()): FocusTrial {
    const key = storageKey(userId);

    try {
        const raw = localStorage.getItem(key);

        if (raw) {
            const saved = JSON.parse(raw) as Partial<FocusTrial>;

            if (
                typeof saved.startedAt === "number" &&
                typeof saved.expiresAt === "number" &&
                saved.startedAt > 0 &&
                saved.expiresAt > saved.startedAt
            ) {
                return {
                    startedAt: saved.startedAt,
                    expiresAt: saved.expiresAt
                };
            }
        }
    } catch {
        // Start a fresh trial below.
    }

    const trial: FocusTrial = {
        startedAt: now,
        expiresAt: now + TRIAL_DAYS * DAY
    };

    localStorage.setItem(key, JSON.stringify(trial));

    return trial;
}

export function getTrialDaysRemaining(
    userId: string,
    now = Date.now()
): number {
    return Math.max(
        0,
        Math.ceil((getTrial(userId, now).expiresAt - now) / DAY)
    );
}

export function isTrialExpired(
    userId: string,
    now = Date.now()
): boolean {
    return getTrial(userId, now).expiresAt <= now;
}

export function removeTrial(userId: string): void {
    localStorage.removeItem(storageKey(userId));
}

export { TRIAL_DAYS };
