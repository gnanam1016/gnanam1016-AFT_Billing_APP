import { Routes } from '@angular/router';
import { Registercompany } from './registercompany/registercompany';
import { LoginComponent } from './login/login';
import { Home } from './home/home';
import { Quickbill } from './quickbill/quickbill';
import { Newbill } from './newbill/newbill';

export const routes: Routes = [
    // { path: '', component: LoginComponent },
    // { path: 'login', component: LoginComponent },
    { path: 'registercompany', component: Registercompany },
    {path:'home',component:Home},
    {path:'quickbill',component:Quickbill},
    {path:"newbill",component:Newbill}
];
