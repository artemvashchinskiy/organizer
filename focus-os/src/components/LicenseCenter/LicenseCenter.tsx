import { useEffect, useState } from "react";
import type { FocusLicense } from "../../services/licenseService";
import {
    createLicenseKey,
    getLicense,
    installLicense,
    getLicenseProgress,
    getLicenseDaysRemaining,
    isLicenseExpired
} from "../../services/licenseService";
import {
    getTrialDaysRemaining,
    isTrialExpired
} from "../../services/trialService";
import "./LicenseCenter.scss";

interface Props {
    open: boolean;
    userId: string;
    onClose: () => void;
    onLicenseChange?: (
        license: FocusLicense | null
    ) => void;
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
    const [license, setLicense] =
        useState<FocusLicense | null>(() => getLicense());

    const [showEnter, setShowEnter] = useState(false);
    const [enteredKey, setEnteredKey] = useState("");
    const [pendingKey, setPendingKey] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [, forceTick] = useState(0);

    useEffect(() => {
        setLicense(getLicense());
        setShowEnter(false);
        setEnteredKey("");
        setPendingKey("");
        setError("");
        setCopied(false);
    }, [userId, open]);

    useEffect(() => {
        const timer = window.setInterval(
            () => forceTick(value => value + 1),
            60_000
        );

        return () => window.clearInterval(timer);
    }, []);

    const trialExpired = isTrialExpired(userId);

    if (!open && !trialExpired) {
        return null;
    }

    const trialDays = getTrialDaysRemaining(userId);

    const progress = license
        ? getLicenseProgress(license)
        : 0;

    const days = license
        ? getLicenseDaysRemaining(license)
        : 0;

    const expired = license
        ? isLicenseExpired(license)
        : false;

    const warning =
        Boolean(
            license &&
            !expired &&
            days <= 15
        );

    const locked =
        expired ||
        (!license && trialExpired);

    function handleClaim() {
        setPendingKey(createLicenseKey());
        setShowEnter(false);
        setError("");
        setCopied(false);
    }

    function handleRenew() {
        setPendingKey(createLicenseKey());
        setShowEnter(false);
        setError("");
        setCopied(false);
    }

    function applyLicense(next: FocusLicense) {
        setLicense(next);
        onLicenseChange?.(next);
        setError("");
        setShowEnter(false);
        setEnteredKey("");
        setPendingKey("");
    }

    function handleEnter() {
        try {
            applyLicense(installLicense(enteredKey));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Invalid license key."
            );
        }
    }

    async function copyKey(key: string) {
        try {
            await navigator.clipboard.writeText(key);
            setCopied(true);

            window.setTimeout(
                () => setCopied(false),
                1500
            );
        } catch {
            setCopied(false);
        }
    }

    return (
        <section
            className={
                "license-panel " +
                (open ? "open " : "") +
                (locked ? "license-locked" : "")
            }
            role="dialog"
            aria-modal="true"
            aria-label="License Center"
        >
            <div className="license-header">
                <div>
                    <h3>License Center</h3>
                    <span>
                        Focus OS complimentary activation
                    </span>
                </div>

                {!locked && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close License Center"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="license-content">
                {!license && (
                    <div className="license-empty">
                        <div className="license-mark">◆</div>

                        <h2>
                            {trialExpired
                                ? "Trial period expired"
                                : "Focus OS is ready"}
                        </h2>

                        <p>
                            {trialExpired
                                ? "Your 15-day trial has ended. Activate a complimentary Focus OS license to continue."
                                : "You have " +
                                  trialDays +
                                  " day" +
                                  (trialDays === 1 ? "" : "s") +
                                  " left in your complimentary trial. Claim your free three-month license whenever you are ready."}
                        </p>

                        {!pendingKey && (
                            <button
                                type="button"
                                className="license-primary"
                                onClick={handleClaim}
                            >
                                Claim Complimentary License
                            </button>
                        )}

                        {pendingKey && (
                            <div className="license-pending">
                                <span>Complimentary license key</span>
                                <code>{pendingKey}</code>

                                <button
                                    type="button"
                                    className="license-copy"
                                    onClick={() =>
                                        copyKey(pendingKey)
                                    }
                                >
                                    {copied
                                        ? "Copied ✓"
                                        : "Copy key"}
                                </button>

                                <p>
                                    Copy this key, then choose
                                    <strong> Enter a License </strong>
                                    and paste it there to activate it.
                                </p>
                            </div>
                        )}

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
                            className={
                                "license-status " +
                                (expired
                                    ? "expired"
                                    : warning
                                      ? "warning"
                                      : "active")
                            }
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
                                        ? "Renew or obtain a new complimentary license to continue."
                                        : days +
                                          " day" +
                                          (days === 1 ? "" : "s") +
                                          " remaining"}
                                </span>
                            </div>
                        </div>

                        <div className="license-timeline">
                            <div className="license-track">
                                <div
                                    className={
                                        "license-track-past " +
                                        (warning || expired
                                            ? "warning"
                                            : "")
                                    }
                                    style={{
                                        width: progress + "%"
                                    }}
                                />

                                <div
                                    className="license-track-marker"
                                    style={{
                                        left: progress + "%"
                                    }}
                                />
                            </div>

                            <div className="license-dates">
                                <span>
                                    {formatDate(
                                        license.issuedAt
                                    )}
                                </span>
                                <span>
                                    {formatDate(
                                        license.expiresAt
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="license-key-card">
                            <span>License key</span>
                            <code>{license.key}</code>

                            <button
                                type="button"
                                onClick={() =>
                                    copyKey(license.key)
                                }
                            >
                                {copied
                                    ? "Copied ✓"
                                    : "Copy"}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="license-secondary"
                            onClick={() =>
                                setShowEnter(true)
                            }
                        >
                            Enter a License
                        </button>

                        {!pendingKey && (
                            <button
                                type="button"
                                className="license-primary"
                                onClick={handleRenew}
                            >
                                Renew / Obtain New License
                            </button>
                        )}

                        {pendingKey && (
                            <div className="license-pending">
                                <span>New complimentary license key</span>
                                <code>{pendingKey}</code>

                                <button
                                    type="button"
                                    className="license-copy"
                                    onClick={() =>
                                        copyKey(pendingKey)
                                    }
                                >
                                    {copied
                                        ? "Copied ✓"
                                        : "Copy key"}
                                </button>

                                <p>
                                    Paste this key into
                                    <strong> Enter a License </strong>
                                    to activate the renewal.
                                </p>
                            </div>
                        )}
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
                                onClick={() =>
                                    setShowEnter(false)
                                }
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
                    Focus OS is free to use. The complimentary
                    license is a product activation and recognition
                    mechanism. No purchase is required.
                </div>
            </div>
        </section>
    );
}
