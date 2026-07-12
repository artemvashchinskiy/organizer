export interface Note {

    id:number;

    date:string;

    text:string;

    // original timer duration in seconds
    duration:number;

    // current countdown value in seconds
    remaining:number;

    completed:boolean;

}