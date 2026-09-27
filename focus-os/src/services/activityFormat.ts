export function formatActivityDate(time:number){

    const d=new Date(time);

    return (

        String(d.getDate()).padStart(2,"0")
        +
        "."
        +
        String(d.getMonth()+1).padStart(2,"0")
        +
        "."
        +
        String(d.getFullYear()).slice(2)
        +
        "-"
        +
        String(d.getHours()).padStart(2,"0")
        +
        ":"
        +
        String(d.getMinutes()).padStart(2,"0")

    );

}