import {
    useState
} from "react";

import {
    connectGoogleDrive
} from "../../services/googleDriveService";


interface Props {

    open: boolean;

    onClose: () => void;

    onConnected: () => void;

}


export default function GoogleDriveLoginModal({

    open,

    onClose,

    onConnected

}: Props) {


    const [
        connecting,
        setConnecting
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    if (!open) {

        return null;

    }


    async function handleConnect() {

        try {

            setConnecting(true);

            setError("");


            await connectGoogleDrive();


            onConnected();

            onClose();

        }

        catch (error) {

            console.error(
                "Google Drive connection failed:",
                error
            );


            setError(
                error instanceof Error
                    ? error.message
                    : "Google Drive connection failed."
            );

        }

        finally {

            setConnecting(false);

        }

    }


    return (

        <div
            className="modal-overlay"
        >

            <div
                className="modal"
            >

                <h3>
                    Google Drive
                </h3>


                <p>
                    Connect FocusOS to Google Drive
                    to store and restore calendar
                    note backups.
                </p>


                {

                    error &&

                    <div
                        className="error"
                    >
                        {error}
                    </div>

                }


                <button
                    onClick={handleConnect}
                    disabled={connecting}
                >

                    {
                        connecting
                            ?
                            "Connecting..."
                            :
                            "Continue with Google"
                    }

                </button>


                <button
                    onClick={onClose}
                    disabled={connecting}
                >

                    Cancel

                </button>

            </div>

        </div>

    );

}