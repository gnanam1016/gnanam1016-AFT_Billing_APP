import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginComponent {

    constructor(private router: Router) {
        // Initialization logic can go here

    }
    public registercompanyRoute() {
        this.router.navigate(['/registercompany']);
    }
}
