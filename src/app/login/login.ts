import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Loginservice } from './loginservice/loginservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Home } from '../home/home';
import { Registercompany } from '../registercompany/registercompany';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css',
    imports: [FormsModule, CommonModule, Home, Registercompany]
})
export class LoginComponent implements OnInit {

    public showLoginForm = true;
    public showCompanyRegisterForm = false;
    public showApp = false;

    constructor(private router: Router, private loginService: Loginservice) {    }
   
    ngOnInit(): void {
        // debugger;
        // if (this.loginService.getLoginStatus()) {
        //     this.loginUser();
        // }
    }

    loginUser() {
        // this.showLoginForm = false;
        // this.showApp = true;
        // this.showCompanyRegisterForm = false;
        // this.loginService.setLoginStatus(true);
        this.router.navigate(['/home']);
    }

    public registerCompany() {
        // alert('Register Company clicked');
        // debugger;
        // this.showLoginForm = false;
        // this.showCompanyRegisterForm = true;
        this.router.navigate(['/registercompany']);

    }

}
