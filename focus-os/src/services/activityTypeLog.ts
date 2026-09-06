export type Provider =
    | "Dropbox"
    | "Google"
    | "OneDrive"
    | "Local";


export interface BackupEntry {

    id: number;

    time: string;

    path: string;
    
    restoredAt?: string;

}


export interface ActivityProviderLog {

    provider: Provider;

    backup: BackupEntry[];

    restore: BackupEntry[];

}