import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AFT_Billing_App');
  //   constructor(private router: Router) {
  //     // Initialization logic can go here
      
  //   }
  // public registercompanyRoute(){
  //   alert("Register company route clicked");
    
  // }
  logout(){}
}
