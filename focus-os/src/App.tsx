import { useEffect, useState } from "react";

import useAuth from "./hooks/useAuth";
import useLocalStorage from "./hooks/useLocalStorage";

import Calendar from "./components/Calendar/Calendar";
import NotePanel from "./components/Notes/NotePanel";
import NotesList from "./components/Notes/NotesList";
import WorkspaceSidebar, { type WorkspaceView } from "./components/WorkspaceSidebar/WorkspaceSidebar";

import LoginModal from "./components/Auth/LoginModal";
import RegisterModal from "./components/Auth/RegisterModal";
import LockScreen from "./components/Auth/LockScreen";
import Sidebar from "./components/Sidebar/Sidebar";

import type { Note } from "./types/note";
import type { FreeNote } from "./types/freeNote";
import type { EisenhowerQuadrant, EisenhowerTask } from "./types/eisenhower";
import type { Expense, ExpenseCategory } from "./types/expense";
import type { BackupEntry } from "./types/activityTypeLog";

import {
    exportNotes,
    createExportFilename,
    mergeImportedNotes,
    restoreLocalBackup
} from "./services/storageService";

import { getGoogleDriveConnection } from "./services/googleDriveService";
import {
    listGoogleDriveBackups,
    uploadGoogleDriveBackup,
    downloadGoogleDriveBackup,
    deleteGoogleDriveBackup
} from "./services/googleDriveApi";

import {
    listBackups,
    downloadBackup,
    finishDropboxLogin,
    getAccessToken,
    deleteDropboxBackup,
    uploadBackup,
    isDropboxAuthCallback
} from "./services/dropboxService";

import ActivityLog from "./components/ActivityLog/ActivityLog";
import {
    addActivity,
    removeBackupActivity
} from "./services/activityServiceLog";

import {
    completeOneDriveAuthCallback,
    isOneDriveAuthCallback
} from "./services/oneDriveService";

import LicenseCenter from "./components/LicenseCenter/LicenseCenter";
import useOneDriveBackup from "./hooks/useOneDriveBackup";
import AboutPanel from "./components/AboutPanel/AboutPanel";

import "./styles/app.scss";
import "./styles/focusGuide.scss";

type FocusPanel = "activity" | "license" | "about" | "danger";

const PANEL_OPEN_EVENT = "focus-os:panel-open";
const PANEL_CLOSE_ALL_EVENT = "focus-os:panel-close-all";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const [workspaceView, setWorkspaceView] =
        useState<WorkspaceView>("notes");

    const {
        user,
        loading,
        isLocked,
        lockUntil,
        login,
        logout: authLogout,
        register,
        unlock,
        touch
    } = useAuth();

    const [selectedDate, setSelectedDate] =
        useState<string | null>(null);
    const [showRegister, setShowRegister] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [editingNote, setEditingNote] =
        useState<Note | null>(null);

    const [notes, setNotes] = useLocalStorage<Note[]>(
        user ? `calendar-notes-${user.id}` : "calendar-empty",
        []
    );

    const [freeNotes, setFreeNotes] =
        useLocalStorage<FreeNote[]>(
            user ? `free-notes-${user.id}` : "free-notes-empty",
            []
        );

    const [matrixTasks, setMatrixTasks] =
        useLocalStorage<EisenhowerTask[]>(
            user ? `focus-matrix-${user.id}` : "focus-matrix-empty",
            []
        );

    const [expenses, setExpenses] =
        useLocalStorage<Expense[]>(
            user ? `focus-expenses-${user.id}` : "focus-expenses-empty",
            []
        );

    const [dropboxConnected, setDropboxConnected] =
        useState(false);

    const [activityOpen, setActivityOpen] = useState(false);
    const [licenseOpen, setLicenseOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    const [activityVersion, setActivityVersion] = useState(0);
    const [restoreMode, setRestoreMode] = useState(false);
    const [currentDate, setCurrentDate] = useState(() => new Date());

    const {
        handleOneDriveRestoreBackup,
        handleOneDriveDeleteBackup
    } = useOneDriveBackup({
        notes,
        setNotes,
        setActivityVersion,
        setRestoreMode,
        setActivityOpen
    });

    function openPanel(panel: FocusPanel) {
        setActivityOpen(panel === "activity");
        setLicenseOpen(panel === "license");
        setAboutOpen(panel === "about");

        window.dispatchEvent(
            new CustomEvent<FocusPanel>(PANEL_OPEN_EVENT, {
                detail: panel
            })
        );
    }

    function closeAllPanels() {
        setActivityOpen(false);
        setLicenseOpen(false);
        setAboutOpen(false);

        window.dispatchEvent(
            new Event(PANEL_CLOSE_ALL_EVENT)
        );
    }

    useEffect(() => {
        function handlePanelOpen(event: Event) {
            const panel =
                (event as CustomEvent<FocusPanel>).detail;

            setActivityOpen(panel === "activity");
            setLicenseOpen(panel === "license");
            setAboutOpen(panel === "about");
        }

        function handleCloseAll() {
            setActivityOpen(false);
            setLicenseOpen(false);
            setAboutOpen(false);
        }

        window.addEventListener(
            PANEL_OPEN_EVENT,
            handlePanelOpen
        );
        window.addEventListener(
            PANEL_CLOSE_ALL_EVENT,
            handleCloseAll
        );

        return () => {
            window.removeEventListener(
                PANEL_OPEN_EVENT,
                handlePanelOpen
            );
            window.removeEventListener(
                PANEL_CLOSE_ALL_EVENT,
                handleCloseAll
            );
        };
    }, []);

    useEffect(() => {
        async function checkDropboxConnection() {
            try {
                await getAccessToken();
                setDropboxConnected(true);
            } catch {
                setDropboxConnected(false);
            }
        }

        checkDropboxConnection();
    }, []);

    useEffect(() => {
        const timer = window.setInterval(
            () => setCurrentDate(new Date()),
            60_000
        );

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        setNotes(prev =>
            prev.map(note => {
                if (!note.running || !note.endAt) return note;

                const left = Math.max(
                    0,
                    Math.floor(
                        (note.endAt - Date.now()) / 1000
                    )
                );

                return {
                    ...note,
                    remaining: left,
                    completed: left === 0,
                    running: left > 0,
                    finishedAt:
                        left === 0
                            ? note.finishedAt ?? Date.now()
                            : note.finishedAt,
                    notified:
                        left === 0 ? false : note.notified,
                    startedAt:
                        left === 0
                            ? undefined
                            : note.startedAt,
                    endAt:
                        left === 0
                            ? undefined
                            : note.endAt
                };
            })
        );
    }, []);

    useEffect(() => {
        const unfinishedAlert = notes.some(
            note => note.completed && !note.notified
        );

        let interval: number | undefined;

        function startFlash() {
            if (interval) return;

            let red = false;

            interval = window.setInterval(() => {
                document.title = red
                    ? "🔴 TIMER FINISHED"
                    : "🟡 React Calendar Timer";
                red = !red;
            }, 800);
        }

        function stopFlash() {
            if (interval) {
                clearInterval(interval);
                interval = undefined;
            }

            document.title = "React Calendar Timer";
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                if (unfinishedAlert) startFlash();
            } else {
                stopFlash();

                setNotes(prev =>
                    prev.map(note =>
                        note.completed && !note.notified
                            ? { ...note, notified: true }
                            : note
                    )
                );
            }
        }

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        if (document.hidden && unfinishedAlert) {
            startFlash();
        }

        return () => {
            stopFlash();
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [notes, setNotes]);

    useEffect(() => {
        async function initializeDropbox() {
            try {
                if (isDropboxAuthCallback()) {
                    const connected =
                        await finishDropboxLogin();
                    setDropboxConnected(connected);
                    return;
                }

                try {
                    await getAccessToken();
                    setDropboxConnected(true);
                } catch {
                    setDropboxConnected(false);
                }
            } catch (error) {
                console.error(
                    "Dropbox login failed:",
                    error
                );
            }
        }

        initializeDropbox();
    }, []);

    useEffect(() => {
        const params =
            new URLSearchParams(window.location.search);

        const code = params.get("code");
        const state = params.get("state");

        if (!code || !state) return;

        async function finishOneDriveLogin() {
            try {
                const connection =
                    await completeOneDriveAuthCallback();

                if (connection) {
                    console.log("OneDrive connected.");
                }
            } catch (error) {
                console.error(
                    "OneDrive login failed:",
                    error
                );
            }
        }

        finishOneDriveLogin();
    }, []);

    useEffect(() => {
        if (!isOneDriveAuthCallback()) return;

        async function finishOneDriveLogin() {
            try {
                const connection =
                    await completeOneDriveAuthCallback();

                if (connection) {
                    console.log("OneDrive connected.");
                }
            } catch (error) {
                console.error(
                    "OneDrive login failed:",
                    error
                );
            }
        }

        finishOneDriveLogin();
    }, []);



    function addFreeNote(text: string) {
        const value = text.trim();
        if (!value) return;

        const now = Date.now();

        setFreeNotes(prev => [
            {
                id: now,
                text: value,
                createdAt: now,
                updatedAt: now
            },
            ...prev
        ]);

        touch();
    }

    function updateFreeNote(id: number, text: string) {
        const value = text.trim();
        if (!value) return;

        setFreeNotes(prev =>
            prev.map(note =>
                note.id === id
                    ? {
                          ...note,
                          text: value,
                          updatedAt: Date.now()
                      }
                    : note
            )
        );

        touch();
    }

    function deleteFreeNote(id: number) {
        setFreeNotes(prev =>
            prev.filter(note => note.id !== id)
        );
        touch();
    }

    function moveFreeNote(id: number, direction: -1 | 1) {
        setFreeNotes(prev => {
            const index =
                prev.findIndex(note => note.id === id);
            const target = index + direction;

            if (
                index < 0 ||
                target < 0 ||
                target >= prev.length
            ) {
                return prev;
            }

            const next = [...prev];
            [next[index], next[target]] =
                [next[target], next[index]];

            return next;
        });

        touch();
    }

    function addMatrixTask(
        text: string,
        quadrant: EisenhowerQuadrant
    ) {
        const value = text.trim();
        if (!value) return;

        setMatrixTasks(prev => [
            ...prev,
            {
                id: Date.now(),
                text: value,
                quadrant,
                completed: false,
                createdAt: Date.now()
            }
        ]);

        touch();
    }

    function toggleMatrixTask(id: number) {
        setMatrixTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? {
                          ...task,
                          completed: !task.completed
                      }
                    : task
            )
        );

        touch();
    }

    function updateMatrixTask(
        id: number,
        text: string
    ) {
        const value = text.trim();
        if (!value) return;

        setMatrixTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, text: value }
                    : task
            )
        );

        touch();
    }

    function moveMatrixTask(
        id: number,
        direction: -1 | 1
    ) {
        setMatrixTasks(prev => {
            const index =
                prev.findIndex(task => task.id === id);

            if (index < 0) return prev;

            const quadrant = prev[index].quadrant;

            const sameQuadrant = prev
                .map((task, idx) => ({
                    task,
                    idx
                }))
                .filter(
                    item =>
                        item.task.quadrant === quadrant
                );

            const localIndex =
                sameQuadrant.findIndex(
                    item => item.task.id === id
                );

            const targetLocalIndex =
                localIndex + direction;

            if (
                targetLocalIndex < 0 ||
                targetLocalIndex >= sameQuadrant.length
            ) {
                return prev;
            }

            const targetIndex =
                sameQuadrant[targetLocalIndex].idx;

            const next = [...prev];

            [next[index], next[targetIndex]] =
                [next[targetIndex], next[index]];

            return next;
        });

        touch();
    }

    function deleteMatrixTask(id: number) {
        setMatrixTasks(prev =>
            prev.filter(task => task.id !== id)
        );
        touch();
    }

    function addExpense(
        amount: number,
        category: ExpenseCategory,
        description: string,
        date: string
    ) {
        setExpenses(prev =>
            [
                ...prev,
                {
                    id: Date.now(),
                    amount,
                    category,
                    description,
                    date,
                    createdAt: Date.now()
                }
            ].sort(
                (a, b) =>
                    b.date.localeCompare(a.date) ||
                    b.createdAt - a.createdAt
            )
        );

        touch();
    }

    function updateExpense(
        id: number,
        amount: number,
        category: ExpenseCategory,
        description: string,
        date: string
    ) {
        if (!Number.isFinite(amount) || amount <= 0) return;

        setExpenses(prev =>
            prev.map(expense =>
                expense.id === id
                    ? {
                          ...expense,
                          amount,
                          category,
                          description:
                              description.trim(),
                          date
                      }
                    : expense
            )
        );

        touch();
    }

    function moveExpense(
        id: number,
        direction: -1 | 1
    ) {
        setExpenses(prev => {
            const index =
                prev.findIndex(
                    expense => expense.id === id
                );

            const target = index + direction;

            if (
                index < 0 ||
                target < 0 ||
                target >= prev.length
            ) {
                return prev;
            }

            const next = [...prev];

            [next[index], next[target]] =
                [next[target], next[index]];

            return next;
        });

        touch();
    }

    function deleteExpense(id: number) {
        setExpenses(prev =>
            prev.filter(expense => expense.id !== id)
        );
        touch();
    }

    function handleLogout() {
        setNotes([]);
        setPanelOpen(false);
        setEditingNote(null);
        setSelectedDate(null);
        closeAllPanels();
        setSidebarOpen(false);
        authLogout();
    }

    function saveNote(note: Note) {
        touch();

        setNotes(prev => {
            const exists =
                prev.some(n => n.id === note.id);

            if (!exists) {
                return [...prev, note];
            }

            return prev.map(n =>
                n.id === note.id ? note : n
            );
        });
    }

    function moveNote(
        id: number,
        direction: -1 | 1
    ) {
        setNotes(prev => {
            const index =
                prev.findIndex(note => note.id === id);

            const target = index + direction;

            if (
                index < 0 ||
                target < 0 ||
                target >= prev.length
            ) {
                return prev;
            }

            const next = [...prev];

            [next[index], next[target]] =
                [next[target], next[index]];

            return next;
        });

        touch();
    }

    function deleteNote(id: number) {
        touch();

        setNotes(prev => {
            const deleting =
                prev.find(n => n.id === id);

            if (!deleting) return prev;

            const next =
                prev.filter(n => n.id !== id);

            if (deleting.duplicateGroup) {
                const sameGroup =
                    next.filter(
                        n =>
                            n.duplicateGroup ===
                            deleting.duplicateGroup
                    );

                if (sameGroup.length === 1) {
                    sameGroup[0].duplicate = false;
                    sameGroup[0].duplicateGroup = undefined;
                    sameGroup[0].duplicateNumber = undefined;
                    sameGroup[0].duplicateColor = undefined;
                    sameGroup[0].duplicateType = undefined;
                    sameGroup[0].duplicateImportedAt = undefined;
                }
            }

            return [...next];
        });
    }

    async function onDropboxBackup() {
        try {
            const result = await uploadBackup(notes);

            addActivity(
                "Dropbox",
                "backup",
                result.path_display
            );

            setActivityVersion(value => value + 1);
            openPanel("activity");

            setTimeout(() => {
                setActivityOpen(false);
                setRestoreMode(false);
            }, 5500);
        } catch (error) {
            console.error(error);
        }
    }

    async function onGoogleDriveBackup() {
        try {
            const connection =
                getGoogleDriveConnection();

            if (!connection) {
                throw new Error(
                    "Google Drive is not connected."
                );
            }

            const filename =
                createExportFilename();

            const result =
                await uploadGoogleDriveBackup(
                    connection.accessToken,
                    filename,
                    notes
                );

            addActivity(
                "Google",
                "backup",
                result.id
            );

            setActivityVersion(value => value + 1);
            setRestoreMode(false);
            openPanel("activity");

            setTimeout(() => {
                setActivityOpen(false);
                setRestoreMode(false);
            }, 5500);
        } catch (error) {
            console.error(
                "Google Drive backup failed:",
                error
            );
        }
    }

    async function onGoogleDriveRestore() {
        try {
            const connection =
                getGoogleDriveConnection();

            if (!connection) {
                throw new Error(
                    "Google Drive is not connected."
                );
            }

            const files =
                await listGoogleDriveBackups(
                    connection.accessToken
                );

            if (files.length === 0) {
                throw new Error(
                    "No Google Drive backups found."
                );
            }

            setRestoreMode(true);
            setActivityVersion(value => value + 1);
            openPanel("activity");
        } catch (error) {
            console.error(
                "Google Drive restore failed:",
                error
            );
        }
    }

    async function onDropboxRestore() {
        try {
            const files = await listBackups();

            if (files.length === 0) {
                throw new Error(
                    "No Dropbox backups found."
                );
            }

            setRestoreMode(true);
            setActivityVersion(value => value + 1);
            openPanel("activity");
        } catch (error) {
            console.error(
                "Dropbox restore failed:",
                error
            );
        }
    }

    async function handleRestoreBackup(
        entry: BackupEntry
    ) {
        try {
            const imported =
                await downloadBackup(entry.path);

            if (Array.isArray(imported)) {
                setNotes(prev =>
                    mergeImportedNotes(
                        prev,
                        imported
                    )
                );
            }

            addActivity(
                "Dropbox",
                "restore",
                entry.path
            );

            setActivityVersion(value => value + 1);

            setTimeout(() => {
                setActivityOpen(false);
                setRestoreMode(false);
            }, 5500);
        } catch (error) {
            console.error(
                "Dropbox restore failed:",
                error
            );
        }
    }

    async function handleGoogleDriveRestoreBackup(
        entry: BackupEntry
    ) {
        try {
            const connection =
                getGoogleDriveConnection();

            if (!connection) {
                throw new Error(
                    "Google Drive is not connected."
                );
            }

            const imported =
                await downloadGoogleDriveBackup(
                    connection.accessToken,
                    entry.path
                );

            if (Array.isArray(imported)) {
                setNotes(prev =>
                    mergeImportedNotes(
                        prev,
                        imported
                    )
                );
            }

            addActivity(
                "Google",
                "restore",
                entry.path
            );

            setActivityVersion(value => value + 1);

            setTimeout(() => {
                setActivityOpen(false);
                setRestoreMode(false);
            }, 5500);
        } catch (error) {
            console.error(
                "Google Drive restore failed:",
                error
            );
        }
    }

    async function handleGoogleDriveDeleteBackup(
        entry: BackupEntry
    ) {
        if (!entry.path) return;

        try {
            const connection =
                getGoogleDriveConnection();

            if (!connection) {
                throw new Error(
                    "Google Drive is not connected."
                );
            }

            await deleteGoogleDriveBackup(
                connection.accessToken,
                entry.path
            );

            removeBackupActivity(entry.path);
            setActivityVersion(value => value + 1);
        } catch (error) {
            console.error(
                "Google Drive backup delete failed:",
                error
            );
        }
    }

    async function handleLocalRestoreBackup(
        entry: BackupEntry
    ) {
        try {
            const imported =
                restoreLocalBackup(entry.path);

            setNotes(prev =>
                mergeImportedNotes(
                    prev,
                    imported
                )
            );

            addActivity(
                "Local",
                "restore",
                entry.path
            );

            setActivityVersion(value => value + 1);

            setTimeout(() => {
                setActivityOpen(false);
                setRestoreMode(false);
            }, 5500);
        } catch (error) {
            console.error(
                "Local restore failed:",
                error
            );
        }
    }

    function updateTimer(
        id: number,
        seconds: number
    ) {
        setNotes(prev =>
            prev.map(note =>
                note.id === id
                    ? {
                          ...note,
                          remaining: seconds
                      }
                    : note
            )
        );
    }

    function startTimer(
        id: number,
        remaining: number
    ) {
        touch();

        const now = Date.now();
        const end = now + remaining * 1000;

        setNotes(prev =>
            prev.map(note =>
                note.id === id
                    ? {
                          ...note,
                          running: true,
                          startedAt: now,
                          endAt: end,
                          completed: false,
                          notified: false,
                          finishedAt: undefined
                      }
                    : note
            )
        );
    }

    function pauseTimer(id: number) {
        touch();

        setNotes(prev =>
            prev.map(note => {
                if (note.id !== id) return note;

                const remaining = note.endAt
                    ? Math.max(
                          0,
                          Math.floor(
                              (note.endAt -
                                  Date.now()) /
                                  1000
                          )
                      )
                    : note.remaining;

                return {
                    ...note,
                    remaining,
                    running: false,
                    startedAt: undefined,
                    endAt: undefined
                };
            })
        );
    }

    function completeNote(id: number) {
        touch();

        setNotes(prev =>
            prev.map(note =>
                note.id === id
                    ? {
                          ...note,
                          remaining: 0,
                          completed: true,
                          running: false,
                          startedAt: undefined,
                          endAt: undefined,
                          finishedAt: Date.now(),
                          notified: false
                      }
                    : note
            )
        );
    }

    if (loading) {
        return (
            <div className="auth-screen">
                Loading...
            </div>
        );
    }

    if (isLocked) {
        return (
            <LockScreen
                lockUntil={lockUntil}
                onUnlock={unlock}
            />
        );
    }

    if (!user) {
        if (showRegister) {
            return (
                <RegisterModal
                    onRegister={async (
                        username,
                        password
                    ) => {
                        const success =
                            await register(
                                username,
                                password
                            );

                        if (success) {
                            setShowRegister(false);
                        }

                        return success;
                    }}
                    onLogin={() =>
                        setShowRegister(false)
                    }
                />
            );
        }

        return (
            <LoginModal
                onLogin={login}
                onRegister={() =>
                    setShowRegister(true)
                }
            />
        );
    }

    const visibleNotes = selectedDate
        ? notes.filter(
              note => note.date === selectedDate
          )
        : notes;

    async function handleDeleteBackup(
        entry: BackupEntry
    ) {
        if (!entry.path) return;

        try {
            await deleteDropboxBackup(
                entry.path
            );

            removeBackupActivity(entry.path);
            setActivityVersion(value => value + 1);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="app">
            <div className="topbar">
                <button
                    className="back"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    ◀
                </button>

                <div className="title">
                    React Calendar Timer
                </div>

                <button
                    className="back"
                    onClick={() =>
                        setSidebarOpen(true)
                    }
                    aria-label="Open system and cloud sidebar"
                    title="System & Cloud"
                >
                    ☰
                </button>
            </div>

            <div className="body layout">
                <div className="calendar-area">
                    <Calendar
                        notes={notes}
                        selectedDate={selectedDate}
                        onSelectDate={date => {
                            touch();
                            setSelectedDate(date);
                            setEditingNote(null);
                            setPanelOpen(true);
                        }}
                    />

                    {selectedDate && (
                        <button
                            className="show-all-notes"
                            onClick={() =>
                                setSelectedDate(null)
                            }
                        >
                            Show all notes
                        </button>
                    )}

                    {panelOpen && (
                        <NotePanel
                            key={
                                editingNote?.id ??
                                "new"
                            }
                            date={
                                editingNote?.date ??
                                selectedDate!
                            }
                            note={editingNote}
                            onSave={note => {
                                saveNote(note);
                                setEditingNote(null);
                                setPanelOpen(false);
                            }}
                            onClose={() => {
                                setEditingNote(null);
                                setPanelOpen(false);
                            }}
                        />
                    )}
                    <section
                        className="calendar-guide"
                        aria-label="How to use Focus OS"
                    >
                        <div className="calendar-guide-header">
                            <span className="calendar-guide-eyebrow">
                                Focus OS · Practical Guide
                            </span>

                            <h2>
                                Turn the calendar into a working plan
                            </h2>

                            <p>
                                Use the calendar for commitments,
                                notes for details, and the other
                                workspace tools only when they add value.
                            </p>
                        </div>

                        <article className="calendar-guide-article">
                            <h3>1. Start with the calendar</h3>
                            <p>
                                Click a day to create a note for that date.
                                Put appointments, deadlines, important calls
                                and other things that genuinely belong to a
                                particular day on the calendar.
                            </p>

                            <h3>2. Write the details, not just the title</h3>
                            <p>
                                Use the note itself for the information you
                                need when the day arrives. A useful entry
                                should reduce the amount of remembering you
                                have to do later.
                            </p>

                            <h3>3. Plan before you execute</h3>
                            <p>
                                Brian Tracy's published time-management
                                material emphasizes planning the coming day,
                                making a list and identifying the most
                                important task before starting work.
                            </p>

                            <h3>4. Review instead of constantly rebuilding</h3>
                            <p>
                                David Allen's Getting Things Done method puts
                                strong emphasis on regular reviews, including
                                checking previous and upcoming calendar data
                                and the actions they trigger.
                            </p>

                            <h3>5. A simple Focus OS routine</h3>
                            <p>
                                Before finishing the day, check tomorrow's
                                calendar. Add the important tasks and
                                information you already know. In the morning,
                                open the calendar, choose the day's real
                                priority, and work through your notes instead
                                of trying to remember everything from your head.
                            </p>

                            <h3>6. Keep the system small</h3>
                            <p>
                                The calendar is the hard landscape: things
                                that must happen on a particular day. Notes
                                hold useful detail. Matrix, Expenses and the
                                other workspace tools are there when you
                                actually need them.
                            </p>
                        </article>
                    </section>
                </div>

                <NotesList
                    notes={visibleNotes}
                    onDelete={deleteNote}
                    onMove={moveNote}
                    onEdit={note => {
                        touch();
                        setEditingNote(note);
                        setSelectedDate(note.date);
                        setPanelOpen(true);
                    }}
                    onTick={updateTimer}
                    onComplete={completeNote}
                    touch={touch}
                    onStart={startTimer}
                    onPause={pauseTimer}
                />
            </div>

            <WorkspaceSidebar
                open={workspaceOpen}
                view={workspaceView}
                onOpen={() => setWorkspaceOpen(true)}
                onClose={() => setWorkspaceOpen(false)}
                onViewChange={setWorkspaceView}
                freeNotes={freeNotes}
                onAddFreeNote={addFreeNote}
                onUpdateFreeNote={updateFreeNote}
                onDeleteFreeNote={deleteFreeNote}
                onMoveFreeNote={moveFreeNote}
                matrixTasks={matrixTasks}
                onAddMatrixTask={addMatrixTask}
                onToggleMatrixTask={toggleMatrixTask}
                onUpdateMatrixTask={updateMatrixTask}
                onMoveMatrixTask={moveMatrixTask}
                onDeleteMatrixTask={deleteMatrixTask}
                expenses={expenses}
                onAddExpense={addExpense}
                onUpdateExpense={updateExpense}
                onMoveExpense={moveExpense}
                onDeleteExpense={deleteExpense}
            />

            <Sidebar
                open={sidebarOpen}
                onOpen={() =>
                    setSidebarOpen(true)
                }
                onClose={() => {
                    setSidebarOpen(false);
                    closeAllPanels();
                }}
                onExport={() => {
                    const filename =
                        exportNotes(notes);

                    addActivity(
                        "Local",
                        "backup",
                        filename
                    );

                    setActivityVersion(
                        value => value + 1
                    );

                    setRestoreMode(false);
                    openPanel("activity");

                    setTimeout(() => {
                        setActivityOpen(false);
                        setRestoreMode(false);
                    }, 5500);
                }}
                onImport={() => {
                    setRestoreMode(true);
                    openPanel("activity");
                }}
                onAboutOpen={() =>
                    openPanel("about")
                }
                dropboxConnected={dropboxConnected}
                onDropboxBackup={onDropboxBackup}
                onDropboxRestore={onDropboxRestore}
                onGoogleDriveBackup={
                    onGoogleDriveBackup
                }
                onGoogleDriveRestore={
                    onGoogleDriveRestore
                }
                onActivityOpen={() =>
                    openPanel("activity")
                }
                onLicenseOpen={() =>
                    openPanel("license")
                }
            />

            <LicenseCenter
                open={licenseOpen}
                userId={user.id}
                onClose={() => {
                    setLicenseOpen(false);
                }}
            />

            <ActivityLog
                open={activityOpen}
                onClose={() => {
                    setActivityOpen(false);
                }}
                onDeleteBackup={
                    handleDeleteBackup
                }
                onGoogleDriveDeleteBackup={
                    handleGoogleDriveDeleteBackup
                }
                onRestoreBackup={
                    handleRestoreBackup
                }
                onLocalRestoreBackup={
                    handleLocalRestoreBackup
                }
                onGoogleDriveRestoreBackup={
                    handleGoogleDriveRestoreBackup
                }
                onOneDriveDeleteBackup={
                    handleOneDriveDeleteBackup
                }
                onOneDriveRestoreBackup={
                    handleOneDriveRestoreBackup
                }
                refreshKey={activityVersion}
                restoreMode={restoreMode}
            />

            <AboutPanel
                open={aboutOpen}
                onClose={() =>
                    setAboutOpen(false)
                }
            />
            <footer className="app-footer">
                <span>
                    © {currentDate.getFullYear()} Focus OS
                </span>

                <span className="app-footer-separator">·</span>

                <span>
                    {currentDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })}
                </span>
            </footer>
        </div>
    );
}

export default App;
