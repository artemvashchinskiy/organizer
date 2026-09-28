export interface OneDriveConnection {

    accessToken: string;

    expiresAt: number;

    refreshToken?: string;

}


export interface OneDriveDriveItem {

    id: string;

    name: string;

    createdDateTime?: string;

    lastModifiedDateTime?: string;

    size?: number;

    file?: {

        mimeType?: string;

    };

    folder?: {

        childCount?: number;

    };

}