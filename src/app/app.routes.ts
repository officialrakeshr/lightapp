import { Routes } from '@angular/router';
import { Userview } from './userview/userview';
import { Adminview } from './adminview/adminview';

export const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  { path: 'user', component: Userview },
  { path: 'admin', component: Adminview },
];