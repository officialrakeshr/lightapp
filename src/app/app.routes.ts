import { Routes } from '@angular/router';
import { Userview } from './userview/userview';
import { Adminview } from './adminview/adminview';

export const routes: Routes = [
  { path: '', redirectTo: 'carnival', pathMatch: 'full' },
  { path: 'carnival', title:'Carnival Light', component: Userview },
  { path: 'godmode', component: Adminview },
];