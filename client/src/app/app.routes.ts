import { Routes } from '@angular/router';
import { Singleplayer } from './pages/singleplayer/singleplayer';
import { Multiplayer } from './pages/multiplayer/multiplayer';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { Result } from './pages/result/result';
import { Auth } from './pages/auth/auth';

export const routes: Routes = [
    {path: '', component: Singleplayer },
    {path: 'multiplayer', component: Multiplayer},
    { path: 'leaderboard', component: Leaderboard },
    { path: 'results', component: Result},
    { path: 'auth', component: Auth},
    { path: '**', component: Singleplayer }
];
