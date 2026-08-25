function base64UrlEncode(buffer: ArrayBuffer): string {

    return btoa(

        String.fromCharCode(...new Uint8Array(buffer))

    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

}

export function generateCodeVerifier(): string {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    let verifier = "";

    const array = new Uint8Array(64);

    crypto.getRandomValues(array);

    array.forEach(value => {

        verifier += chars[value % chars.length];

    });

    return verifier;

}

export async function generateCodeChallenge(
    verifier: string
): Promise<string> {

    const encoder = new TextEncoder();

    const data = encoder.encode(verifier);

    const digest = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    return base64UrlEncode(digest);

}