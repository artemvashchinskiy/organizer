
import { useEffect, useState } from "react";
import "./Sidebar.scss";

import {
    connectDropbox
}
from "../../services/dropboxService";

import {
    connectGoogleDrive,
    isGoogleDriveConnected
} from "../../services/googleDriveService";

import {
    connectOneDrive,
    isOneDriveConnected,
    completeOneDriveAuthCallback
} from "../../services/oneDriveService";

interface SidebarProps {

    open:boolean;

    onOpen:()=>void;

    onClose:()=>void;

    onExport:()=>void;

    onImport:()=>void;

    dropboxConnected:boolean;

    onDropboxBackup:()=>Promise<void>;

    onDropboxRestore:()=>Promise<void>;

    onGoogleDriveBackup:()=>Promise<void>;

    onGoogleDriveRestore:()=>Promise<void>;

    onOneDriveBackup:()=>Promise<void>;

    onOneDriveRestore:()=>Promise<void>;

    onActivityOpen:()=>void;

}

function Sidebar({

    open,
    onOpen,
    onClose,
    onExport,
    onImport,
    dropboxConnected,
    onDropboxBackup,
    onDropboxRestore,
    onGoogleDriveBackup,
    onGoogleDriveRestore,
    onOneDriveBackup,
    onOneDriveRestore,
    onActivityOpen

}:SidebarProps){

    const [connecting, setConnecting] = useState(false);

    const [
        googleConnected,
        setGoogleConnected
    ] = useState(
        isGoogleDriveConnected()
    );

    const [
        googleConnecting,
        setGoogleConnecting
    ] = useState(false);

    const [

        oneDriveConnecting,

        setOneDriveConnecting

    ] = useState(false);


    const [

        oneDriveConnected,

        setOneDriveConnected

    ] = useState(

        isOneDriveConnected()

    );

    useEffect(()=>{
        if(dropboxConnected){
            setConnecting(false);
        }

    },[dropboxConnected]);

    useEffect(() => {
        setOneDriveConnected(
            isOneDriveConnected()
        );
    }, []);

    useEffect(() => {

    async function completeOneDriveLogin() {

            try {

                const connection =
                    await completeOneDriveAuthCallback();

                if (connection) {

                    setOneDriveConnected(true);

                }

            }

            catch (error) {

                console.error(
                    "OneDrive connection failed:",
                    error
                );

            }

        }

        completeOneDriveLogin();

    }, []);

    async function handleGoogleConnect() {

        try {

            setGoogleConnecting(true);

            await connectGoogleDrive();

            setGoogleConnected(true);

        }

        catch(error) {

            console.error(
                "Google Drive connection failed:",
                error
            );

        }

        finally {

            setGoogleConnecting(false);

        }

    }

    async function handleOneDriveConnect() {

        try {

            setOneDriveConnecting(true);

            await connectOneDrive();

        }

        catch(error) {

            console.error(

                "OneDrive connection failed:",

                error

            );

            setOneDriveConnecting(false);

        }

    }

    return(

        <>

            {
                open &&

                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            }

            <aside
                className={`sidebar ${open ? "open" : ""}`}
            >

                <div

                    className="sidebar-handle"
                    onClick={open ? onClose : onOpen}
                >
                    {open ? "❯" : "☰"} 

                </div>

                <div className="sidebar-header">

                    <b>Navigation</b>

                    <button
                        className="close-sidebar"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>


                <div className="sidebar-content">
                    <div className="sidebar-section">

                        <h4>Calendar</h4>

                    </div>



                    <div className="sidebar-section">

                        <h4>Data Backup</h4>

                        <button onClick={onImport}>
                            ⬆ Import Calendar Notes
                        </button>

                        <button onClick={onExport}>
                            ⬇ Export Calendar Notes
                        </button>

                    </div>



                    <div className="sidebar-section">

                        <h4>Cloud</h4>

                        {

                            !dropboxConnected

                            ?

                            <button

                                className="dropbox-bar"

                                disabled={connecting}

                                onClick={async()=>{

                                    setConnecting(true);

                                    await connectDropbox();

                                }}

                            >

                                Dropbox

                            </button>

                            :

                            <div className="dropbox-bar">

                                <button

                                    className="dropbox-main"

                                    disabled

                                >

                                    Dropbox ✓

                                </button>

                                <button onClick={onDropboxBackup}>

                                    Backup

                                </button>

                                <button onClick={onDropboxRestore}>

                                    Restore

                                </button>

                            </div>

                        }

                        {

                            !googleConnected

                                ?

                                <button

                                    disabled={googleConnecting}

                                    onClick={handleGoogleConnect}

                                >

                                    {
                                        googleConnecting
                                            ?
                                            "Connecting..."
                                            :
                                            "Google Drive"
                                    }

                                </button>

                                :

                                <div className="dropbox-bar">

                                    <button
                                        className="dropbox-main"
                                        disabled
                                    >

                                        GoogleDrive✓

                                    </button>

                                    <button onClick={onGoogleDriveBackup}
                                    >

                                        Backup

                                    </button>

                                    <button onClick={onGoogleDriveRestore}
                                    >

                                        Restore

                                    </button>

                                </div>

                        }

                        {
                            !oneDriveConnected

                                ?

                                <button

                                    disabled={oneDriveConnecting}

                                    onClick={handleOneDriveConnect}

                                >

                                    {

                                        oneDriveConnecting

                                            ?

                                            "Connecting..."

                                            :

                                            "OneDrive"

                                    }

                                </button>

                                :

                                <div className="dropbox-bar">

                                    <button

                                        className="dropbox-main"

                                        disabled

                                    >

                                        OneDrive ✓

                                    </button>


                                    <button

                                        onClick={onOneDriveBackup}

                                    >

                                        Backup

                                    </button>


                                    <button

                                        onClick={onOneDriveRestore}

                                    >

                                        Restore

                                    </button>

                                </div>
                        }

                    </div>

                    <button

                        onClick={onActivityOpen}

                    >

                        Activity Log

                    </button>



                    <div className="sidebar-section">

                        <h4>Settings</h4>

                        <button>
                            Danger Zone
                        </button>

                    </div>



                    <div className="sidebar-section">

                        <button>

                            About

                        </button>

                    </div>
                </div>

            </aside>

        </>

    );

}

export default Sidebar;