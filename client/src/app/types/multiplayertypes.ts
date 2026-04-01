export interface MultiplayerUser {
    userId: string;
    username: string;
}

export interface MultiplayerGameDTO {
    connectionId: string;
    playerOne: MultiplayerUser;
    playerTwo: MultiplayerUser;
}

export interface MultiplayerUpdate {
    index: number;
    charState: number;
    isActive: number;
}