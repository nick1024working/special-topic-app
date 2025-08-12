import { Routes } from '@angular/router';
import { MemberDetailsComponent } from './member-details/member-details.component';

export const MEMBER_ROUTES: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: MemberDetailsComponent },
  { path: '**', redirectTo: 'profile' },
];
