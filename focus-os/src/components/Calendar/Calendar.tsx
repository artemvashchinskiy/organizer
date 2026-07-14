import { useState } from "react";
import CalendarCell from "./CalendarCell";
import type { Note } from "../../types/note";


interface CalendarProps {

    notes: Note[];

    onSelectDate: (date:string)=>void;

}



function Calendar({

    notes,
    onSelectDate

}:CalendarProps){


    const today = new Date();


    const [month,setMonth] = useState(
        today.getMonth()
    );


    const [year,setYear] = useState(
        today.getFullYear()
    );



    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();



    const cells = [];



    // Empty cells before first day
    for(let i = 0; i < firstDay; i++){

        cells.push(

            <div

                key={`empty-${i}`}

                className="calendar-cell empty"

            />

        );

    }



    // Month days
    for(
        let day = 1;
        day <= daysInMonth;
        day++
    ){


        const date =

            `${year}-` +

            `${String(month + 1).padStart(2,"0")}-` +

            `${String(day).padStart(2,"0")}`;



        cells.push(

            <CalendarCell

                key={date}

                date={date}

                day={day}

                notes={notes}

                onClick={onSelectDate}

            />

        );

    }


    function todayMonth(){

        const now = new Date();

        setMonth(
            now.getMonth()
        );

        setYear(
            now.getFullYear()
        );

    }


    function previousMonth(){


        if(month === 0){

            setMonth(11);

            setYear(
                year - 1
            );

        }
        else{

            setMonth(
                month - 1
            );

        }

    }





    function nextMonth(){


        if(month === 11){

            setMonth(0);

            setYear(
                year + 1
            );

        }
        else{

            setMonth(
                month + 1
            );

        }

    }





    const monthName =

        new Date(
            year,
            month
        )
        .toLocaleString(
            "default",
            {
                month:"long",
                year:"numeric"
            }
        );





    return(

        <div className="calendar">


            <div className="calendar-header">


                <button

                    className="back"

                    onClick={previousMonth}

                >
                    ◀
                </button>



                <div className="title">

                    {monthName}

                </div>


                <button

                    className="back"

                    onClick={todayMonth}

                >
                    Today
                </button>



                <button

                    className="back"

                    onClick={nextMonth}

                >
                    ▶
                </button>


            </div>





            <div className="weekdays">


                {
                    [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat"

                    ].map(day=>

                        <div key={day}>

                            {day}

                        </div>

                    )
                }


            </div>





            <div className="calendar-grid">

                {cells}

            </div>



        </div>

    )

}



export default Calendar;