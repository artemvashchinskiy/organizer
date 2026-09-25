import { useState } from "react";
import "./DangerZone.scss";

import {
    hashPassword,
    verifyPassword
} from "../../utils/crypto";

interface StoredUser {
    id: string;
    username: string;
    passwordHash: string;
    createdAt: number;
    lastActive: number;
}

interface Session {
    userId: string;
    lastActivity: number;
    failedAttempts: number;
    lockUntil: number | null;
    lockLevel: number;
}

const USERS_KEY = "calendar-users";
const SESSION_KEY = "calendar-session";

function getUsers(): StoredUser[] {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getSession(): Session | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getCurrentUser(): StoredUser | null {
    const session = getSession();
    if (!session) return null;

    return (
        getUsers().find(
            user => user.id === session.userId
        ) ?? null
    );
}

function saveUsers(users: StoredUser[]) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

function clearUserData(userId: string) {
    const userKeys = [
        `calendar-notes-${userId}`,
        `free-notes-${userId}`,
        `focus-matrix-${userId}`,
        `focus-expenses-${userId}`,
        `focus-trial-${userId}`,
        `focus-license-reminder-${userId}`
    ];

    for (const key of userKeys) {
        localStorage.removeItem(key);
    }
}

export default function DangerZone() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<
        "menu" | "password" | "clear" | "remove"
    >("menu");

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [busy, setBusy] =
        useState(false);

    const user = getCurrentUser();

    function reset() {
        setMode("menu");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage("");
        setBusy(false);
    }

    function close() {
        reset();
        setOpen(false);
    }

    async function verifyCurrentPassword(): Promise<StoredUser | null> {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            setMessage("No active account.");
            return null;
        }

        if (!currentPassword) {
            setMessage("Enter your current password.");
            return null;
        }

        const valid = await verifyPassword(
            currentPassword,
            currentUser.passwordHash
        );

        if (!valid) {
            setMessage("Incorrect password.");
            return null;
        }

        return currentUser;
    }

    async function changePassword() {
        setMessage("");

        if (!newPassword || !confirmPassword) {
            setMessage("Complete all password fields.");
            return;
        }

        if (newPassword.length < 4) {
            setMessage(
                "New password must contain at least 4 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match.");
            return;
        }

        setBusy(true);

        try {
            const currentUser =
                await verifyCurrentPassword();

            if (!currentUser) return;

            const passwordHash =
                await hashPassword(newPassword);

            const users =
                getUsers().map(user =>
                    user.id === currentUser.id
                        ? {
                            ...user,
                            passwordHash,
                            lastActive: Date.now()
                        }
                        : user
                );

            saveUsers(users);

            setMessage(
                "Password changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Password change failed."
            );
        } finally {
            setBusy(false);
        }
    }

    async function clearAllLocalData() {
        setMessage("");
        setBusy(true);

        try {
            const currentUser =
                await verifyCurrentPassword();

            if (!currentUser) return;

            clearUserData(currentUser.id);

            setMessage(
                "Account data cleared. Your account and Focus OS license remain."
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not clear account data."
            );
        } finally {
            setBusy(false);
        }
    }

    async function removeAccount() {
        setMessage("");
        setBusy(true);

        try {
            const currentUser =
                await verifyCurrentPassword();

            if (!currentUser) return;

            clearUserData(currentUser.id);

            saveUsers(
                getUsers().filter(
                    user => user.id !== currentUser.id
                )
            );

            localStorage.removeItem(SESSION_KEY);

            /*
             * The license is intentionally NOT removed.
             * It is a device/app activation, not account data.
             *
             * Cloud backups are also not silently deleted here.
             * They belong to external providers and should be removed
             * through their provider-specific controls.
             */
            window.location.reload();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not remove account."
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <button
                onClick={() => {
                    setOpen(true);
                    reset();
                }}
            >
                Danger Zone
            </button>

            {!open || !user ? null : (
                <div className="danger-overlay">
                    <section
                        className="danger-panel"
                        role="dialog"
                        aria-modal="true"
                    >
                        <header className="danger-header">
                            <div>
                                <span className="danger-eyebrow">
                                    Account
                                </span>

                                <h2>
                                    Danger Zone
                                </h2>

                                <p>
                                    {user.username}
                                </p>
                            </div>

                            <button
                                className="danger-close"
                                onClick={close}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </header>

                        {mode === "menu" && (
                            <div className="danger-actions">
                                <button
                                    onClick={() => {
                                        setMode("password");
                                        setMessage("");
                                    }}
                                >
                                    Change password
                                </button>

                                <button
                                    onClick={() => {
                                        setMode("clear");
                                        setMessage("");
                                    }}
                                >
                                    Clear all local data
                                </button>

                                <button
                                    className="danger-delete"
                                    onClick={() => {
                                        setMode("remove");
                                        setMessage("");
                                    }}
                                >
                                    Remove account
                                </button>
                            </div>
                        )}

                        {mode === "password" && (
                            <div className="danger-form">
                                <h3>
                                    Change password
                                </h3>

                                <input
                                    type="password"
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={event =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={event =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={event =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <div className="danger-row">
                                    <button
                                        onClick={() =>
                                            setMode("menu")
                                        }
                                        disabled={busy}
                                    >
                                        Back
                                    </button>

                                    <button
                                        className="primary-danger"
                                        onClick={changePassword}
                                        disabled={busy}
                                    >
                                        {busy
                                            ? "Changing..."
                                            : "Change password"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === "clear" && (
                            <div className="danger-form">
                                <h3>
                                    Clear all local data
                                </h3>

                                <p className="warning">
                                    This removes this account's
                                    calendar notes, free notes,
                                    Matrix tasks, expenses and
                                    trial state. Your account and
                                    Focus OS license remain.
                                </p>

                                <input
                                    type="password"
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={event =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <div className="danger-row">
                                    <button
                                        onClick={() =>
                                            setMode("menu")
                                        }
                                        disabled={busy}
                                    >
                                        Back
                                    </button>

                                    <button
                                        className="primary-danger"
                                        onClick={clearAllLocalData}
                                        disabled={busy}
                                    >
                                        {busy
                                            ? "Clearing..."
                                            : "Clear data"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === "remove" && (
                            <div className="danger-form">
                                <h3>
                                    Remove account
                                </h3>

                                <p className="warning">
                                    This permanently removes the
                                    local account and its account
                                    data. The Focus OS license
                                    remains available on this
                                    device. Cloud backups are not
                                    silently deleted because they
                                    live with external providers.
                                </p>

                                <input
                                    type="password"
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={event =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                />

                                <div className="danger-row">
                                    <button
                                        onClick={() =>
                                            setMode("menu")
                                        }
                                        disabled={busy}
                                    >
                                        Back
                                    </button>

                                    <button
                                        className="primary-danger"
                                        onClick={removeAccount}
                                        disabled={busy}
                                    >
                                        {busy
                                            ? "Removing..."
                                            : "Remove account"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {message && (
                            <p
                                className={
                                    message.includes(
                                        "successfully"
                                    )
                                        ? "danger-message success"
                                        : "danger-message"
                                }
                            >
                                {message}
                            </p>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}
