import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Loginservice } from './loginservice/loginservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Home } from '../home/home';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css',
    imports: [FormsModule,CommonModule,Home]
})
export class LoginComponent {
    constructor(private router: Router, private loginService: Loginservice) {
    }
    public showLoginForm = true;
    loginUser(){
        this.showLoginForm = false;
        // this.loginService.setLoginStatus(true);
        this.router.navigate(['/registercompany']);
    }

    public registercompanyRoute() {
        this.router.navigate(['/registercompany']);
    }
}
