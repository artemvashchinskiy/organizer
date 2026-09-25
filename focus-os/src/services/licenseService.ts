export interface FocusLicense {
    key: string;
    issuedAt: number;
    expiresAt: number;
}

const PREFIX = "FOCUS";
const STORAGE_KEY = "focus-license";
const REMINDER_KEY = "focus-license-reminder";
const DAY = 24 * 60 * 60 * 1000;
const LICENSE_DAYS = 90;

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

export function getLicense(): FocusLicense | null {
    try {
        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        const license =
            JSON.parse(raw) as FocusLicense;

        if (
            !license ||
            typeof license.key !== "string" ||
            typeof license.issuedAt !== "number" ||
            typeof license.expiresAt !== "number"
        ) {
            return null;
        }

        if (!isValidLicenseKey(license.key)) {
            return null;
        }

        return license;
    } catch {
        return null;
    }
}

export function installLicense(
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
        STORAGE_KEY,
        JSON.stringify(license)
    );

    return license;
}

export function obtainDevelopmentLicense(): FocusLicense {
    return installLicense(
        createLicenseKey()
    );
}

export function removeLicense(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMINDER_KEY);
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
    now = Date.now()
): boolean {
    const last = Number(
        localStorage.getItem(
            REMINDER_KEY
        ) || 0
    );

    if (now - last < DAY) {
        return false;
    }

    localStorage.setItem(
        REMINDER_KEY,
        String(now)
    );

    return true;
}
