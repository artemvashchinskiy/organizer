import { useEffect, useState } from "react";

import useAuth from "./hooks/useAuth";
import useLocalStorage from "./hooks/useLocalStorage";

import Calendar from "./components/Calendar/Calendar";
import NotePanel from "./components/Notes/NotePanel";
import NotesList from "./components/Notes/NotesList";

import LoginModal from "./components/Auth/LoginModal";
import RegisterModal from "./components/Auth/RegisterModal";
import LockScreen from "./components/Auth/LockScreen";
import Sidebar from "./components/Sidebar/Sidebar";
import type { Note } from "./types/note";
import type { BackupEntry } from "./types/activityTypeLog";
import { exportNotes, createExportFilename, mergeImportedNotes, restoreLocalBackup } from "./services/storageService";
import {
    getGoogleDriveConnection
} from "./services/googleDriveService";

import {
    listGoogleDriveBackups,
    uploadGoogleDriveBackup,
    downloadGoogleDriveBackup,
    deleteGoogleDriveBackup
} from "./services/googleDriveApi";
import {  listBackups, downloadBackup, finishDropboxLogin, getAccessToken, deleteDropboxBackup } from "./services/dropboxService";
import {  uploadBackup} from "./services/dropboxService";
import ActivityLog from "./components/ActivityLog/ActivityLog";
import { addActivity, removeBackupActivity} from "./services/activityServiceLog"; 
import {
    completeOneDriveAuthCallback,
    getOneDriveConnection,
    backupToOneDrive,
    getOneDriveBackups,
    restoreFromOneDrive,
    removeOneDriveBackup
} from "./services/oneDriveService";
import {
    listOneDriveBackups,
    uploadOneDriveBackup,
    downloadOneDriveBackup,
    deleteOneDriveBackup
} from "./services/oneDriveApi";

import "./styles/app.scss";



function App(){

    const [sidebarOpen,setSidebarOpen]=
        useState(false);

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






    const [selectedDate, setSelectedDate] = useState<string | null>(null);


    const [showRegister,setShowRegister] = useState(false);

    const [panelOpen, setPanelOpen] = useState(false);



    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const [notes,setNotes] = useLocalStorage<Note[]>(


        user

        ?

        `calendar-notes-${user.id}`

        :

        "calendar-empty",


        []
    
    );


    const [

        dropboxConnected,

        setDropboxConnected

    ] = useState(false);

    const [

        activityOpen,

        setActivityOpen

    ] = useState(false);
 
    const [
        activityVersion,
        setActivityVersion
    ] = useState(0); 

    const [
        restoreMode,
        setRestoreMode
    ] = useState(false);


    useEffect(() => {

        async function checkDropboxConnection() {

            try {

                await getAccessToken();

                setDropboxConnected(true);

            }

            catch {

                setDropboxConnected(false);

            }

        }

        checkDropboxConnection();

    }, []);

    

    useEffect(()=>{

        setNotes(prev=>

            prev.map(note=>{

                if(

                    !note.running ||

                    !note.endAt

                ){

                    return note;

                }

                const left = Math.max(

                    0,

                    Math.floor(

                        (note.endAt-Date.now())/1000

                    )

                );

                return {

                    ...note,

                    remaining:left,

                    completed:left===0,

                    running:left>0,

                    finishedAt:
                        left===0
                            ? note.finishedAt ?? Date.now()
                            : note.finishedAt,

                    notified:
                        left===0
                            ? false
                            : note.notified,

                    startedAt:
                        left===0
                            ? undefined
                            : note.startedAt,

                    endAt:
                        left===0
                            ? undefined
                            : note.endAt
                };

            })

        );

    },[]);


    useEffect(() => {

        const unfinishedAlert = notes.some(
            note =>
                note.completed &&
                !note.notified
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

                if (unfinishedAlert) {
                    startFlash();
                }

            } else {

                stopFlash();

                setNotes(prev =>
                    prev.map(note =>
                        note.completed && !note.notified
                            ? {
                                ...note,
                                notified: true
                            }
                            : note
                    )
                );

            }

        }

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        // If the timer finished while the tab was already hidden,
        // begin flashing immediately.
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

                // 1. Just returned from Dropbox?

                const connected =
                    await finishDropboxLogin();

                if (connected) {

                    setDropboxConnected(true);

                    return;

                }

                // 2. Already connected?

                try {

                    await getAccessToken();

                    setDropboxConnected(true);

                }

                catch {

                    setDropboxConnected(false);

                }

            }

            catch (error) {

                console.error(error);

                if (error instanceof Error) {

                    alert(error.message);

                }

                else {

                    alert(String(error));

                }

            }

        }

    initializeDropbox();

}, []);

 
    useEffect(() => {

        async function finishOneDriveLogin() {

            try {

                const connection =

                    await completeOneDriveAuthCallback();


                if (connection) {

                    console.log(

                        "OneDrive connected."

                    );

                }

            }

            catch(error) {

                console.error(

                    "OneDrive login failed:",

                    error

                );

            }

        }


        finishOneDriveLogin();

    }, []);



    function handleLogout(){


        // clear current UI state

        setNotes([]);


        setPanelOpen(false);

        setEditingNote(null);

        setSelectedDate(null);



        // remove authentication session

        authLogout();


    }









    function saveNote(note:Note){

        touch();

        setNotes(prev=>{

            const exists = prev.some(
                n=>n.id===note.id
            );


            if(!exists){

                return [
                    ...prev,
                    note
                ];

            }


            return prev.map(n=>

                n.id===note.id

                ?

                note

                :

                n

            );

        });

    }



    // async function handleImport(){

    //     try{

    //         const imported =
    //             await importNotes();

    //         setNotes(prev =>
    //             mergeImportedNotes(
    //                 prev,
    //                 imported.notes
    //             )
    //         );

    //         addActivity(
    //             "Local",
    //             "restore",
    //             imported.filename
    //         );

    //         setActivityVersion(
    //             value => value + 1
    //         );

    //         // LOCAL restore mode
    //         setRestoreMode(true);
    //         setActivityOpen(true);

    //         setTimeout(() => {

    //             setActivityOpen(false);
    //             setRestoreMode(false);

    //         }, 5500);

    //     }

    //     catch(error){

    //         console.error(
    //             "Local import failed:",
    //             error
    //         );

    //     }

    // }





    function deleteNote(id:number){

        touch();

        setNotes(prev=>{

            const deleting =
                prev.find(n=>n.id===id);

            if(!deleting)
                return prev;

            let next =
                prev.filter(n=>n.id!==id);

            if(deleting.duplicateGroup){

                const sameGroup =
                    next.filter(

                        n=>
                            n.duplicateGroup===
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

            const result =
                await uploadBackup(notes);

            addActivity(
                "Dropbox",
                "backup",
                result.path_display
            );

            setActivityVersion(
                value => value + 1
            );

            setActivityOpen(true);

            setTimeout(() => {

                setActivityOpen(false);
                setRestoreMode(false);

            }, 5500);

        }

        catch (error) {

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


            setActivityVersion(
                value => value + 1
            );


            setRestoreMode(false);

            setActivityOpen(true);


            setTimeout(() => {

                setActivityOpen(false);
                setRestoreMode(false);

            }, 5500);

        }

        catch (error) {

            console.error(
                "Google Drive backup failed:",
                error
            );

        }

    }

    async function onOneDriveBackup() {

        try {

            const filename =

                `focus-os-backup-${Date.now()}.json`;


            const result =

                await backupToOneDrive(

                    notes,

                    filename

                );


            addActivity(

                "OneDrive",

                "backup",

                result.id

            );


            setActivityVersion(

                value => value + 1

            );


        }

        catch (error) {

            console.error(

                "OneDrive backup failed:",

                error

            );

        }

    }

    function onOneDriveRestore() {

        setRestoreMode(true);

        setActivityOpen(true);

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

            setActivityOpen(true);

            setActivityVersion(
                value => value + 1
            );

        }

        catch (error) {

            console.error(
                "Google Drive restore failed:",
                error
            );

        }

    }

    async function onOneDriveBackup() {

        try {

            const connection =

                getOneDriveConnection();


            if (!connection) {

                throw new Error(

                    "OneDrive is not connected."

                );

            }


            const filename =

                createExportFilename();


            const result =

                await uploadOneDriveBackup(

                    connection.accessToken,

                    filename,

                    notes

                );


            addActivity(

                "OneDrive",

                "backup",

                result.id

            );


            setActivityVersion(

                value => value + 1

            );


            setRestoreMode(false);

            setActivityOpen(true);


            setTimeout(() => {

                setActivityOpen(false);

                setRestoreMode(false);

            }, 5500);

        }

        catch(error) {

            console.error(

                "OneDrive backup failed:",

                error

            );

        }

    }

    async function onOneDriveRestore() {

        try {

            const connection =

                getOneDriveConnection();


            if (!connection) {

                throw new Error(

                    "OneDrive is not connected."

                );

            }


            const files =

                await listOneDriveBackups(

                    connection.accessToken

                );


            if (files.length === 0) {

                throw new Error(

                    "No OneDrive backups found."

                );

            }


            setRestoreMode(true);

            setActivityOpen(true);


            setActivityVersion(

                value => value + 1

            );

        }

        catch(error) {

            console.error(

                "OneDrive restore failed:",

                error

            );

        }

    }

    async function handleOneDriveRestoreBackup(

        entry: BackupEntry

    ) {

        try {

            const connection =

                getOneDriveConnection();


            if (!connection) {

                throw new Error(

                    "OneDrive is not connected."

                );

            }


            const imported =

                await downloadOneDriveBackup(

                    connection.accessToken,

                    entry.path

                );


            if (!Array.isArray(imported)) {

                throw new Error(

                    "Invalid OneDrive backup format."

                );

            }


            setNotes(prev =>

                mergeImportedNotes(

                    prev,

                    imported

                )

            );


            addActivity(

                "OneDrive",

                "restore",

                entry.path

            );


            setActivityVersion(

                value => value + 1

            );


            setTimeout(() => {

                setActivityOpen(false);

                setRestoreMode(false);

            }, 5500);

        }

        catch(error) {

            console.error(

                "OneDrive restore failed:",

                error

            );

        }

    }

    async function handleOneDriveDeleteBackup(

        entry: BackupEntry

    ) {

        if (!entry.path) {

            return;

        }


        try {

            const connection =

                getOneDriveConnection();


            if (!connection) {

                throw new Error(

                    "OneDrive is not connected."

                );

            }


            await deleteOneDriveBackup(

                connection.accessToken,

                entry.path

            );


            removeBackupActivity(

                entry.path

            );


            setActivityVersion(

                value => value + 1

            );

        }

        catch(error) {

            console.error(

                "OneDrive backup delete failed:",

                error

            );

        }

    }
 
    // async function onDropboxRestore(){

    //     try{

    //         const files =
    //             await listBackups();

    //         if(files.length === 0){

    //             throw new Error(
    //                 "No Dropbox backups found."
    //             );

    //         }

    //         const latestBackup =
    //             files[0];

    //         const imported =
    //             await downloadBackup(
    //                 latestBackup.path_lower
    //             );

    //         if(!Array.isArray(imported)){

    //             throw new Error(
    //                 "Invalid Dropbox backup format."
    //             );

    //         }

    //         setNotes(prev =>
    //             mergeImportedNotes(
    //                 prev,
    //                 imported
    //             )
    //         );

    //         addActivity(
    //             "Dropbox",
    //             "restore",
    //             latestBackup.path_lower
    //         );

    //         setActivityVersion(
    //             value => value + 1
    //         );

    //             setRestoreMode(true);
    //             setActivityOpen(true);

    //     }

    //     catch(error){

    //         console.error(
    //             "Dropbox restore failed:",
    //             error
    //         );

    //     }

    // } 


    async function onDropboxRestore(){

        try{

            const files =
                await listBackups();

            if(files.length === 0){

                throw new Error(
                    "No Dropbox backups found."
                );

            }

            setRestoreMode(true);

            setActivityOpen(true);

            setActivityVersion(
                value => value + 1
            );

        }

        catch(error){

            console.error(
                "Dropbox restore failed:",
                error
            );

        }

    }


    async function handleRestoreBackup(
        entry: BackupEntry
    ){

        try{

            const imported =
                await downloadBackup(
                    entry.path
                );

            if(!Array.isArray(imported)){

                throw new Error(
                    "Invalid Dropbox backup format."
                );

            }

            setNotes(prev =>
                mergeImportedNotes(
                    prev,
                    imported
                )
            );

            addActivity(
                "Dropbox",
                "restore",
                entry.path
            );

            setActivityVersion(
                value => value + 1
            );

            setTimeout(() => {

                setActivityOpen(false);
                setRestoreMode(false);

            }, 5500);

        }

        catch(error){

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


            if (!Array.isArray(imported)) {

                throw new Error(
                    "Invalid Google Drive backup format."
                );

            }


            setNotes(prev =>
                mergeImportedNotes(
                    prev,
                    imported
                )
            );


            addActivity(
                "Google",
                "restore",
                entry.path
            );


            setActivityVersion(
                value => value + 1
            );


            setTimeout(() => {

                setActivityOpen(false);
                setRestoreMode(false);

            }, 5500);

        }

        catch (error) {

            console.error(
                "Google Drive restore failed:",
                error
            );

        }

    }

    async function handleGoogleDriveDeleteBackup(
        entry: BackupEntry
    ) {

        if (!entry.path) {

            return;

        }


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


            removeBackupActivity(
                entry.path
            );


            setActivityVersion(
                value => value + 1
            );

        }

        catch (error) {

            console.error(
                "Google Drive backup delete failed:",
                error
            );

        }

    }

    async function handleLocalRestoreBackup(
        entry: BackupEntry
    ){

        try{

            const imported =
                restoreLocalBackup(
                    entry.path
                );

                console.log("LOCAL RESTORE REQUESTED:", entry.path);


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


            setActivityVersion(
                value => value + 1
            );


            setTimeout(() => {

                setActivityOpen(false);

                setRestoreMode(false);

            }, 5500);
            

        }

        catch(error){

            console.error(
                "Local restore failed:",
                error
            );

        }

    }





    function updateTimer(
        id:number,
        seconds:number
    ){

        setNotes(prev=>

            prev.map(note=>

                note.id === id

                ?

                {
                    ...note,
                    remaining:seconds
                }

                :

                note

            )

        );

    }

    function startTimer(

        id:number,

        remaining:number

    ){

        touch();

        const now = Date.now();

        const end = now + remaining * 1000;

        setNotes(prev=>

            prev.map(note=>

                note.id===id

                ?

                {
                    ...note,

                    running:true,

                    startedAt:now,

                    endAt:end,

                    completed:false,

                    notified:false,

                    finishedAt:undefined
                }

                :

                note

            )

        );

    }


    function pauseTimer(id:number){

        touch();

        setNotes(prev=>

            prev.map(note=>{

                if(note.id!==id)
                    return note;

                const remaining = note.endAt

                    ?

                    Math.max(

                        0,

                        Math.floor(

                            (note.endAt-Date.now())/1000

                        )

                    )

                    :

                    note.remaining;

                return{

                    ...note,

                    remaining,

                    running:false,

                    startedAt:undefined,

                    endAt:undefined

                };

            })

        );

    }






function completeNote(id:number){

    touch();

 


    setNotes(prev=>

        prev.map(note=>

            note.id===id

            ?

            {
                ...note,
                remaining:0,
                completed:true,
                running:false,
                startedAt:undefined,
                endAt:undefined,
                finishedAt:Date.now(),
                notified:false
            }

            :

            note

        )

    );

}


    if(loading){

        return (

            <div className="auth-screen">

                Loading...

            </div>

        );

    }

    // LOCKED

    if(isLocked){


        return (

            <LockScreen

                lockUntil={lockUntil}

                onUnlock={unlock}

            />

        );


    }









    // NOT AUTHENTICATED

    if(!user){



        if(showRegister){


            return (


                <RegisterModal


                    onRegister={async(

                        username,

                        password

                    )=>{


                        const success = await register(

                            username,

                            password

                        );



                        if(success){

                            setShowRegister(false);

                        }



                        return success;


                    }}




                    onLogin={()=>{


                        setShowRegister(false);


                    }}



                />


            );


        }

 



        return (



            <LoginModal


                onLogin={login}



                onRegister={()=>{


                    setShowRegister(true);


                }}


            />


        );


    }


    const visibleNotes =

        selectedDate

        ?

        notes.filter(
            note=>note.date===selectedDate
        )

        :

        notes;

    async function handleDeleteBackup(
        entry: BackupEntry
    ){

        if(!entry.path){

            return;

        }

        try{

            await deleteDropboxBackup(
                entry.path
            );

            removeBackupActivity(
                entry.path
            );
            setActivityVersion(
                value => value + 1
            );

        }

        catch(error){

            console.error(error);

        }

    }


    return(


        <div className="app">





            <div className="topbar">





                <button

                    className="back"

                    onClick={handleLogout}

                >

                    ◀


                </button>







                <div className="title">


                    React Calendar Timer


                </div>








                <button

                    className="back"

                    onClick={()=>setSidebarOpen(true)}

                >

                    ☰

                </button>






            </div>









            <div className="body layout">







                <div className="calendar-area">







                    <Calendar


                        notes={notes} 
                        selectedDate={selectedDate}


                    onSelectDate={(date)=>{

                        touch();

                        setSelectedDate(date);

                        setEditingNote(null);

                        setPanelOpen(true);

                    }}



                    />


                    {
                        selectedDate &&

                        <button

                            className="show-all-notes"

                            onClick={()=>{

                                setSelectedDate(null); 

                            }}

                        >

                            Show all notes

                        </button>

                    }






                    {
                        panelOpen &&

                        

                        <NotePanel

                            key={editingNote?.id ?? "new"}

                            date={editingNote?.date ?? selectedDate!}

                            note={editingNote}


                            onSave={(note)=>{


                                saveNote(note);

                                setEditingNote(null);

                                setPanelOpen(false);


                            }}



                            onClose={()=>{


                                setEditingNote(null);
                                setPanelOpen(false);


                            }}

                        />


                    }







                </div>









            <NotesList

                notes={visibleNotes}

                onDelete={deleteNote}

                    onEdit={(note)=>{

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


            <Sidebar
                open={sidebarOpen}
                onOpen={()=>setSidebarOpen(true)}
                onClose={()=>{
                    setSidebarOpen(false);
                    setActivityOpen(false);
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

                    // LOCAL backup log
                    setRestoreMode(false);
                    setActivityOpen(true);

                    setTimeout(() => {

                        setActivityOpen(false);
                        setRestoreMode(false);

                    }, 5500);

                }}
                onImport={() => {
                    setRestoreMode(true);
                    setActivityOpen(true);
                }}
                dropboxConnected={dropboxConnected}
                onDropboxBackup={onDropboxBackup}
                onDropboxRestore={onDropboxRestore}
                onGoogleDriveBackup={onGoogleDriveBackup}
                onGoogleDriveRestore={onGoogleDriveRestore}
                onOneDriveBackup={onOneDriveBackup}
                onOneDriveRestore={onOneDriveRestore}
                onActivityOpen={()=>setActivityOpen(true)}  

            /> 
            <ActivityLog

                open={activityOpen}

                onClose={()=>setActivityOpen(false)}

                onDeleteBackup={handleDeleteBackup}

                onGoogleDriveDeleteBackup={
                    handleGoogleDriveDeleteBackup
                }

                onRestoreBackup={handleRestoreBackup} 

                onLocalRestoreBackup={handleLocalRestoreBackup}

                onGoogleDriveRestoreBackup={handleGoogleDriveRestoreBackup}
                
                onOneDriveDeleteBackup={handleOneDriveDeleteBackup}

                onOneDriveRestoreBackup={handleOneDriveRestoreBackup}

                refreshKey={activityVersion}

                restoreMode={restoreMode}

            />
  
        </div>
    

    )
    

}



export default App;