export interface GoogleDriveFile {

    id: string;

    name: string;

    mimeType: string;

    modifiedTime?: string;

    createdTime?: string;

}

export interface GoogleDriveConnection {

    accessToken: string;

    expiresAt: number;

    email?: string;

}