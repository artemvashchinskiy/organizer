interface AboutModalProps{

    onClose:()=>void;

}

function AboutModal({

    onClose

}:AboutModalProps){

    return(

        <div className="modal">

            <h2>

                React Calendar Timer

            </h2>

            <p>

                Version 1.0

            </p>

            <p>

                Created with React & TypeScript.

            </p>

            <button
                onClick={onClose}
            >
                Close
            </button>

        </div>

    );

}

export default AboutModal;