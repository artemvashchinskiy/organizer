export interface FocusLicense {
    key: string;
    issuedAt: number;
    expiresAt: number;
}

const PREFIX = "FOCUS";
const STORAGE_PREFIX = "focus-license-";
const DAY = 24 * 60 * 60 * 1000;
const LICENSE_DAYS = 90;

function storageKey(userId: string): string {
    return STORAGE_PREFIX + userId;
}

function randomPart(length = 4): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(length);

    crypto.getRandomValues(bytes);

    return Array.from(
        bytes,
        byte => chars[byte % chars.length]
    ).join("");
}

function checksum(input: string): string {
    let value = 0;

    for (let i = 0; i < input.length; i++) {
        value =
            (value * 31 + input.charCodeAt(i)) >>> 0;
    }

    return value
        .toString(36)
        .toUpperCase()
        .padStart(4, "0")
        .slice(-4);
}

export function createLicenseKey(): string {
    const body = [
        PREFIX,
        randomPart(),
        randomPart(),
        randomPart()
    ].join("-");

    return body + "-" + checksum(body);
}

export function isValidLicenseKey(key: string): boolean {
    const normalized = key.trim().toUpperCase();
    const parts = normalized.split("-");

    if (
        parts.length !== 5 ||
        parts[0] !== PREFIX
    ) {
        return false;
    }

    if (
        parts
            .slice(1, 4)
            .some(
                part =>
                    !/^[A-Z0-9]{4}$/.test(part)
            )
    ) {
        return false;
    }

    return (
        parts[4] ===
        checksum(parts.slice(0, 4).join("-"))
    );
}

export function getLicense(
    userId: string
): FocusLicense | null {
    try {
        const raw =
            localStorage.getItem(
                storageKey(userId)
            );

        if (!raw) return null;

        const license =
            JSON.parse(raw) as FocusLicense;

        if (
            !license ||
            typeof license.key !== "string" ||
            !license.issuedAt ||
            !license.expiresAt
        ) {
            return null;
        }

        return license;
    } catch {
        return null;
    }
}

export function installLicense(
    userId: string,
    key: string,
    now = Date.now()
): FocusLicense {
    const normalized =
        key.trim().toUpperCase();

    if (!isValidLicenseKey(normalized)) {
        throw new Error(
            "Invalid Focus OS license key."
        );
    }

    const license: FocusLicense = {
        key: normalized,
        issuedAt: now,
        expiresAt:
            now + LICENSE_DAYS * DAY
    };

    localStorage.setItem(
        storageKey(userId),
        JSON.stringify(license)
    );

    return license;
}

export function obtainDevelopmentLicense(
    userId: string
): FocusLicense {
    return installLicense(
        userId,
        createLicenseKey()
    );
}

export function removeLicense(
    userId: string
): void {
    localStorage.removeItem(
        storageKey(userId)
    );

    localStorage.removeItem(
        "focus-license-reminder-" + userId
    );
}

export function getLicenseProgress(
    license: FocusLicense,
    now = Date.now()
): number {
    const total = Math.max(
        1,
        license.expiresAt -
            license.issuedAt
    );

    return Math.min(
        100,
        Math.max(
            0,
            ((now - license.issuedAt) /
                total) *
                100
        )
    );
}

export function getLicenseDaysRemaining(
    license: FocusLicense,
    now = Date.now()
): number {
    return Math.max(
        0,
        Math.ceil(
            (license.expiresAt - now) /
                DAY
        )
    );
}

export function isLicenseExpired(
    license: FocusLicense,
    now = Date.now()
): boolean {
    return license.expiresAt <= now;
}

export function shouldShowRenewalReminder(
    userId: string,
    now = Date.now()
): boolean {
    const key =
        "focus-license-reminder-" +
        userId;

    const last = Number(
        localStorage.getItem(key) || 0
    );

    if (now - last < DAY) {
        return false;
    }

    localStorage.setItem(
        key,
        String(now)
    );

    return true;
}
