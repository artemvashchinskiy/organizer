import type { Note } from "../../types/note";


interface CalendarCellProps {

    date:string;

    day:number;

    notes:Note[];

    onClick:(date:string)=>void;

}



function CalendarCell({

    date,
    day,
    notes,
    onClick

}:CalendarCellProps){



    const dayNotes =
        notes.filter(
            note=>note.date===date
        );



    const hasNotes =
        dayNotes.length > 0;



    const completedCount =
        dayNotes.filter(
            note=>note.completed
        ).length;



    return(

        <div

            className={
                `
                calendar-cell
                ${hasNotes ? "has-note":""}
                `
            }


            onClick={()=>onClick(date)}

        >


            <span className="day-number">

                {day}

            </span>



            {
                hasNotes &&

                <div className="note-indicator">


                    <span>
                        ●
                    </span>


                    {
                        completedCount > 0 &&
                        <small>
                            {completedCount}/{dayNotes.length}
                        </small>
                    }


                </div>

            }


        </div>

    )

}


export default CalendarCell;