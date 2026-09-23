import { useEffect, useState } from "react";
import type { FocusLicense } from "../../services/licenseService";
import {
    getLicense,
    installLicense,
    obtainDevelopmentLicense,
    getLicenseProgress,
    getLicenseDaysRemaining,
    isLicenseExpired
} from "../../services/licenseService";
import "./LicenseCenter.scss";

interface Props {
    open: boolean;
    userId: string;
    onClose: () => void;
    onLicenseChange?: (license: FocusLicense | null) => void;
}

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(timestamp);
}

export default function LicenseCenter({
    open,
    userId,
    onClose,
    onLicenseChange
}: Props) {
    const [license, setLicense] = useState<FocusLicense | null>(
        () => getLicense(userId)
    );
    const [showEnter, setShowEnter] = useState(false);
    const [enteredKey, setEnteredKey] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [, forceTick] = useState(0);

    useEffect(() => {
        setLicense(getLicense(userId));
        setShowEnter(false);
        setEnteredKey("");
        setError("");
    }, [userId, open]);

    useEffect(() => {
        if (!open) return;

        const timer = window.setInterval(
            () => forceTick(value => value + 1),
            60_000
        );

        return () => window.clearInterval(timer);
    }, [open]);

    if (!open) return null;

    const progress = license ? getLicenseProgress(license) : 0;
    const days = license ? getLicenseDaysRemaining(license) : 0;
    const expired = license ? isLicenseExpired(license) : false;
    const warning = Boolean(license && !expired && days <= 15);

    function applyLicense(next: FocusLicense) {
        setLicense(next);
        onLicenseChange?.(next);
        setError("");
        setShowEnter(false);
        setEnteredKey("");
    }

    function handleObtain() {
        const next = obtainDevelopmentLicense(userId);
        applyLicense(next);
    }

    function handleEnter() {
        try {
            const next = installLicense(userId, enteredKey);
            applyLicense(next);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Invalid license key."
            );
        }
    }

    async function copyKey() {
        if (!license) return;

        try {
            await navigator.clipboard.writeText(license.key);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="license-panel">
            <div className="license-header">
                <div>
                    <h3>License Center</h3>
                    <span>Focus OS account license</span>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close License Center"
                >
                    ✕
                </button>
            </div>

            <div className="license-content">
                {!license && (
                    <div className="license-empty">
                        <div className="license-mark">◆</div>

                        <h2>No active license</h2>

                        <p>
                            Activate a three-month Focus OS license
                            to use the workspace.
                        </p>

                        <button
                            type="button"
                            className="license-primary"
                            onClick={handleObtain}
                        >
                            Obtain a License
                        </button>

                        <button
                            type="button"
                            className="license-secondary"
                            onClick={() => setShowEnter(true)}
                        >
                            Enter a License
                        </button>
                    </div>
                )}

                {license && (
                    <>
                        <div
                            className={`license-status ${
                                expired
                                    ? "expired"
                                    : warning
                                        ? "warning"
                                        : "active"
                            }`}
                        >
                            <span className="license-status-dot" />

                            <div>
                                <strong>
                                    {expired
                                        ? "LICENSE EXPIRED"
                                        : warning
                                            ? "RENEWAL WINDOW"
                                            : "LICENSE ACTIVE"}
                                </strong>

                                <span>
                                    {expired
                                        ? "Renew to continue using Focus OS."
                                        : `${days} day${
                                            days === 1 ? "" : "s"
                                        } remaining`}
                                </span>
                            </div>
                        </div>

                        <div className="license-timeline">
                            <div className="license-track">
                                <div
                                    className={`license-track-past ${
                                        warning || expired
                                            ? "warning"
                                            : ""
                                    }`}
                                    style={{
                                        width: `${progress}%`
                                    }}
                                />

                                <div
                                    className="license-track-marker"
                                    style={{
                                        left: `${progress}%`
                                    }}
                                />
                            </div>

                            <div className="license-dates">
                                <span>
                                    {formatDate(license.issuedAt)}
                                </span>

                                <span>
                                    {formatDate(license.expiresAt)}
                                </span>
                            </div>
                        </div>

                        <div className="license-key-card">
                            <span>License key</span>

                            <code>{license.key}</code>

                            <button
                                type="button"
                                onClick={copyKey}
                            >
                                {copied ? "Copied ✓" : "Copy"}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="license-secondary"
                            onClick={() => setShowEnter(true)}
                        >
                            Enter a License
                        </button>

                        <button
                            type="button"
                            className="license-primary"
                            onClick={handleObtain}
                        >
                            Renew / Obtain New License
                        </button>
                    </>
                )}

                {showEnter && (
                    <div className="license-enter">
                        <label htmlFor="focus-license-key">
                            License key
                        </label>

                        <input
                            id="focus-license-key"
                            value={enteredKey}
                            onChange={event =>
                                setEnteredKey(
                                    event.target.value.toUpperCase()
                                )
                            }
                            placeholder="FOCUS-XXXX-XXXX-XXXX-XXXX"
                            autoFocus
                        />

                        {error && (
                            <div className="license-error">
                                {error}
                            </div>
                        )}

                        <div className="license-enter-actions">
                            <button
                                type="button"
                                onClick={() => setShowEnter(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="license-primary"
                                onClick={handleEnter}
                            >
                                Activate
                            </button>
                        </div>
                    </div>
                )}

                <div className="license-note">
                    Your license belongs to this Focus OS account.
                    Backup/restore integration is prepared for the
                    next licensing step.
                </div>
            </div>
        </div>
    );
}
