export type EisenhowerQuadrant =
    | "urgent-important"
    | "not-urgent-important"
    | "urgent-not-important"
    | "not-urgent-not-important";

export interface EisenhowerTask {
    id: number;
    text: string;
    quadrant: EisenhowerQuadrant;
    completed: boolean;
    createdAt: number;
}
