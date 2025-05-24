import { SuCoComponent } from './components/quan-ly/su-co/su-co.component';

const routes: Routes = [
  {
    path: 'quanly/suco',
    component: SuCoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['QL'] }
  }
]; 