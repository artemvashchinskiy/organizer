import type { GoogleDriveFile } from "../types/googleDrive";
import { createFocusOSBackup, restoreFocusOSBackup } from "./appBackupService";

const DRIVE_API="https://www.googleapis.com/drive/v3";
const UPLOAD_API="https://www.googleapis.com/upload/drive/v3";
const FOLDER_NAME="FocusOS";
const JSON_MIME="application/json";

async function googleFetch<T>(url:string,accessToken:string,options:RequestInit={}):Promise<T>{
    const response=await fetch(url,{...options,headers:{...(options.headers||{}),Authorization:`Bearer ${accessToken}`}});
    if(!response.ok) throw new Error(`Google Drive API error ${response.status}: ${await response.text()}`);
    return response.json();
}

export async function findFocusOSFolder(accessToken:string):Promise<GoogleDriveFile|null>{
    const query=encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const data=await googleFetch<{files:GoogleDriveFile[]}>(`${DRIVE_API}/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,createdTime)`,accessToken);
    return data.files[0]||null;
}

export async function createFocusOSFolder(accessToken:string):Promise<GoogleDriveFile>{
    return googleFetch<GoogleDriveFile>(`${DRIVE_API}/files`,accessToken,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:FOLDER_NAME,mimeType:"application/vnd.google-apps.folder"})});
}

export async function getFocusOSFolder(accessToken:string):Promise<GoogleDriveFile>{
    return await findFocusOSFolder(accessToken) || await createFocusOSFolder(accessToken);
}

export async function listGoogleDriveBackups(accessToken:string):Promise<GoogleDriveFile[]>{
    const folder=await getFocusOSFolder(accessToken);
    const query=encodeURIComponent(`'${folder.id}' in parents and trashed=false and mimeType='${JSON_MIME}'`);
    const data=await googleFetch<{files:GoogleDriveFile[]}>(`${DRIVE_API}/files?q=${query}&orderBy=createdTime desc&pageSize=100&fields=files(id,name,mimeType,modifiedTime,createdTime)`,accessToken);
    return data.files;
}

export async function uploadGoogleDriveBackup(accessToken:string,filename:string,notes:unknown):Promise<GoogleDriveFile>{
    const folder=await getFocusOSFolder(accessToken);
    const metadata={name:filename,parents:[folder.id],mimeType:JSON_MIME};
    const body=JSON.stringify(
        Array.isArray(notes) ? createFocusOSBackup(notes) : notes
    );
    const boundary="-------FocusOSBoundary";
    const multipartBody=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${JSON_MIME}\r\n\r\n${body}\r\n--${boundary}--`;
    return googleFetch<GoogleDriveFile>(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,createdTime`,accessToken,{method:"POST",headers:{"Content-Type":`multipart/related; boundary=${boundary}`},body:multipartBody});
}

export async function downloadGoogleDriveBackup(accessToken:string,fileId:string):Promise<unknown>{
    const response=await fetch(`${DRIVE_API}/files/${fileId}?alt=media`,{headers:{Authorization:`Bearer ${accessToken}`}});
    if(!response.ok) throw new Error(`Google Drive download failed: ${await response.text()}`);
    const data=await response.json();
    restoreFocusOSBackup(data);
    return data;
}

export async function deleteGoogleDriveBackup(accessToken:string,fileId:string):Promise<void>{
    const response=await fetch(`${DRIVE_API}/files/${fileId}`,{method:"DELETE",headers:{Authorization:`Bearer ${accessToken}`} });
    if(!response.ok && response.status!==204) throw new Error(`Google Drive delete failed: ${await response.text()}`);
}
