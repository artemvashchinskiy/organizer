import type { Note } from "../types/note";
import {
    createFocusOSBackup,
    getCalendarNotesFromBackup,
    restoreFocusOSBackup
} from "./appBackupService";

export function createExportFilename(): string {
    const now = new Date();

    return `FocusOS-${String(now.getDate()).padStart(2,"0")}.${String(
        now.getMonth()+1
    ).padStart(2,"0")}.${String(now.getFullYear()).slice(2)}-${String(
        now.getHours()
    ).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}.json`;
}

export function exportNotes(notes: Note[]): string {
    const filename = createExportFilename();
    const backup = createFocusOSBackup(notes);

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type:"application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);

    const backups = JSON.parse(
        localStorage.getItem("local-note-backups") || "[]"
    );

    backups.unshift({
        filename,
        createdAt:Date.now(),
        notes:backup
    });

    localStorage.setItem(
        "local-note-backups",
        JSON.stringify(backups.slice(0,10))
    );

    return filename;
}

export async function importNotes():Promise<{
    notes:Note[];
    filename:string;
}>{
    return new Promise((resolve,reject)=>{
        const input=document.createElement("input");

        input.type="file";
        input.accept=".json";

        input.onchange=()=>{
            const file=input.files?.[0];

            if(!file){
                reject("No file selected");
                return;
            }

            const reader=new FileReader();

            reader.onload=()=>{
                try{
                    const data=JSON.parse(reader.result as string);
                    const notes=getCalendarNotesFromBackup(data) as Note[];

                    if(!Array.isArray(notes)){
                        throw new Error("Invalid JSON");
                    }

                    resolve({
                        notes,
                        filename:file.name
                    });
                }catch(error){
                    reject(error);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    });
}

export function restoreLocalBackup(filename:string):Note[]{
    const backups=JSON.parse(
        localStorage.getItem("local-note-backups") || "[]"
    );

    const backup=backups.find((item:{
        filename:string;
        createdAt:number;
        notes:unknown;
    })=>item.filename===filename);

    if(!backup){
        throw new Error("Local backup not found.");
    }

    restoreFocusOSBackup(backup.notes);

    return getCalendarNotesFromBackup(backup.notes) as Note[];
}

export async function importNotesFromFile(file:File):Promise<Note[]>{
    return new Promise((resolve,reject)=>{
        const reader=new FileReader();

        reader.onload=()=>{
            try{
                const data=JSON.parse(reader.result as string);
                const notes=getCalendarNotesFromBackup(data) as Note[];

                if(!Array.isArray(notes)){
                    throw new Error("Invalid JSON");
                }

                resolve(notes);
            }catch(error){
                reject(error);
            }
        };

        reader.onerror=()=>reject(
            new Error("Failed to read file.")
        );

        reader.readAsText(file);
    });
}

export function mergeImportedNotes(
    current:Note[],
    imported:Note[]
):Note[]{
    const result=[...current];

    imported.forEach(importedNote=>{
        const existing=current.find(
            note=>note.id===importedNote.id
        );

        if(!existing){
            result.push(importedNote);
            return;
        }

        if(JSON.stringify(existing)===JSON.stringify(importedNote)){
            return;
        }

        let group=existing.duplicateGroup;
        let duplicateNumber=existing.duplicateNumber;
        let duplicateColor=existing.duplicateColor;

        if(!group){
            group=`D-${Date.now()}`;

            duplicateNumber=Math.max(
                0,
                ...result.map(
                    note=>note.duplicateNumber ?? 0
                )
            )+1;

            const colors=[
                "#ffe082",
                "#90caf9",
                "#a5d6a7",
                "#ce93d8",
                "#ffab91",
                "#80cbc4",
                "#b39ddb",
                "#fff59d"
            ];

            duplicateColor=
                colors[(duplicateNumber-1)%colors.length];

            existing.duplicate=true;
            existing.duplicateGroup=group;
            existing.duplicateNumber=duplicateNumber;
            existing.duplicateColor=duplicateColor;
            existing.duplicateType="original";
        }

        result.push({
            ...importedNote,
            id:Number(
                `${Date.now()}${Math.floor(Math.random()*1000)}`
            ),
            duplicate:true,
            duplicateGroup:group,
            duplicateNumber,
            duplicateColor,
            duplicateType:"imported",
            duplicateImportedAt:Date.now()
        });
    });

    return result;
}
