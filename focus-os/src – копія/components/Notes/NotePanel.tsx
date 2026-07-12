import { useState } from "react";
import type { Note } from "../../types/note";


interface NotePanelProps {

    date:string;

    onSave:(note:Note)=>void;

    onClose:()=>void;

}



function NotePanel({

    date,
    onSave,
    onClose

}:NotePanelProps){



    const [text,setText] = useState("");



    const [minutes,setMinutes] = useState(25);



    function saveNote(){


    const timerSeconds = minutes * 60;


    const newNote:Note = {

        id:Date.now(),

        date,

        text,

        duration:timerSeconds,

        remaining:timerSeconds,

        completed:false

    };



        onSave(newNote);


        setText("");

    }





    return(

        <div className="note-panel">


            <div className="panel-header">


                <b>
                    New Note
                </b>


                <button

                    onClick={onClose}

                >
                    ✕
                </button>


            </div>





            <div className="small">

                Date:
                {" "}
                {date}

            </div>





            <textarea

                value={text}

                onChange={
                    e=>setText(e.target.value)
                }

                placeholder="Write your task..."

            />





            <label>

                Timer minutes:

            </label>



            <input

                type="number"

                min="1"

                value={minutes}

                onChange={
                    e=>
                    setMinutes(
                        Number(e.target.value)
                    )
                }

            />





            <div className="actions">


                <button

                    onClick={saveNote}

                    disabled={!text.trim()}

                >

                    Save

                </button>



                <button

                    onClick={onClose}

                >

                    Cancel

                </button>


            </div>



        </div>

    )

}


export default NotePanel;