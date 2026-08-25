export interface Note{

    id:number;

    date:string;

    text:string;

    duration:number;

    remaining:number;

    completed:boolean;

    running:boolean;

    startedAt?:number;

    endAt?:number;

    finishedAt?:number; 

    notified?:boolean;

    duplicate?: boolean;

    duplicateGroup?: string;

    duplicateImportedAt?: number;

    duplicateColor?: string;

    duplicateNumber?: number;

    duplicateType?: "original" | "imported";

}