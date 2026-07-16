import "./Sidebar.scss";

interface SidebarProps {

    open:boolean;

    onOpen:()=>void;

    onClose:()=>void;

}

function Sidebar({

    open,
    onOpen,
    onClose

}:SidebarProps){

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

                        <h4>Backup</h4>

                        <button>
                            Import JSON
                        </button>

                        <button>
                            Export JSON
                        </button>

                    </div>



                    <div className="sidebar-section">

                        <h4>Cloud</h4>

                        <button>
                            Dropbox
                        </button>

                        <button>
                            Google Drive
                        </button>

                        <button>
                            OneDrive
                        </button>

                    </div>



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