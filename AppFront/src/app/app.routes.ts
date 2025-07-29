import { Routes } from '@angular/router';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { LoginComponent } from './login/login.component';
import { CalendrierComponent } from './calendrier/calendrier.component';
import { UserComponent } from './user/user.component';
import { TacheComponent } from './tache/tache.component';
import { TacheAgentComponent } from './tache-agent/tache-agent.component';
import { ServicesComponent } from './gestion-services/gestion-services.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { authGuard, adminGuard } from './auth.guard';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'agent-dashboard', component: AgentDashboardComponent, canActivate: [authGuard]},
    {path: 'calendrier', component: CalendrierComponent, canActivate: [authGuard, adminGuard]},
    {path: 'compte', component: UserComponent, canActivate: [authGuard, adminGuard]},
    {path: 'tache', component: TacheComponent, canActivate: [authGuard, adminGuard]},
    {path: 'tacheAgent', component: TacheAgentComponent, canActivate: [authGuard]},
    {path: 'services', component: ServicesComponent, canActivate: [authGuard, adminGuard]},
    {path: 'dashboard-manager', component: DashboardManagerComponent, canActivate: [authGuard, adminGuard]},
    {path: '', redirectTo: 'login', pathMatch:'full'}
];
