import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AlertService } from './alert.service';
import { BehaviorSubject } from 'rxjs';
import { MultiplayerGameDTO, MultiplayerUpdate } from '../types/multiplayertypes';

@Injectable({
  providedIn: 'root',
})
export class HubService {
  public hubConnection!: signalR.HubConnection;

  public connectionState$ = new BehaviorSubject<boolean>(false);
  public matchMakingStatus$ = new BehaviorSubject<string>('idle');
  public game$ = new BehaviorSubject<MultiplayerGameDTO | null>(null);
  public gameId$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly alertService: AlertService) {}

  startConnection(): Promise<void> {
    const token = localStorage.getItem('user');
    const accessToken = token ? JSON.parse(token).token : '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5262/hubs/game', {
        accessTokenFactory: () => accessToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    this.registerCoreListeners();

    return this.hubConnection
      .start()
      .then(() => {
        this.alertService.show('Connected to game server.', 'success');
        this.connectionState$.next(true);
      })
      .catch((err) => {
        console.error('SignalR Connection Error: ', err);
        this.alertService.show('Error while connecting to game server! ' + err, 'error');
        this.connectionState$.next(false);
        throw err;
      });
  }

  private registerCoreListeners() {
    this.hubConnection.on('WaitingForMatch', () => {
      this.matchMakingStatus$.next('waiting');
    });

    this.hubConnection.on('MatchFound', (data: any) => {
      const { game, gameId } = data;
      // Set gameId FIRST so it's available when game$ subscribers run synchronously
      this.gameId$.next(gameId);
      this.game$.next(game);
      this.matchMakingStatus$.next('matched');
    });

    this.hubConnection.on('OpponentDisconnected', () => {
      this.matchMakingStatus$.next('opponent_disconnected');
      this.alertService.show('Your opponent has disconnected.', 'warning');
    });
  }

  findMatch() {
    this.matchMakingStatus$.next('searching');
    return this.hubConnection.invoke('FindMatch').catch((err) => {
      console.error('Error invoking FindMatch: ', err);
      this.alertService.show('Error while trying to find a match! ' + err, 'error');
      this.matchMakingStatus$.next('idle');
    });
  }

  cancelMatchMaking() {
    this.matchMakingStatus$.next('idle');
    return this.hubConnection.invoke('CancelMatchMaking').catch((err) => {
      console.error('Error invoking CancelMatchMaking: ', err);
      this.alertService.show('Error while trying to cancel matchmaking! ' + err, 'error');
    });
  }

  sendUpdate(update: MultiplayerUpdate) {
    const gameId = this.gameId$.getValue();
    if (!gameId) {
      this.alertService.show('No active game to send updates for.', 'error');
      return;
    }
    return this.hubConnection.invoke('SendGameUpdate', gameId, update).catch((err) => {
      console.error('Error invoking SendGameUpdate: ', err);
      this.alertService.show('Error while sending game update! ' + err, 'error');
    });
  }

  onReceiveKeyUpdate(callback: (update: MultiplayerUpdate) => void) {
    this.hubConnection.on('ReceiveUpdate', (update: MultiplayerUpdate) => {
      callback(update);
    });
  }

  sendGameText(gameId: string, user: string, text: string) {
    return this.hubConnection.invoke('SendGameTextOnLoad', gameId, user, text).catch((err) => {
      console.error('Error sending game text: ', err);
    });
  }

  onReceiveGameText(callback: (text: string) => void) {
    this.hubConnection.on('ReceiveMessage', (_user: string, message: string) => {
      callback(message);
    });
  }
}
