import { Routes } from '@angular/router';
import { Singleplayer } from './pages/singleplayer/singleplayer';
import { Multiplayer } from './pages/multiplayer/multiplayer';
import { Leaderboard } from './pages/leaderboard/leaderboard';

export const routes: Routes = [
    {path: '', component: Singleplayer },
    {path: 'multiplayer', component: Multiplayer},
    { path: 'leaderboard', component: Leaderboard },
    { path: '**', component: Singleplayer }
];
