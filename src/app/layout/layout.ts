import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  logout() {
    alert('Logged out!');
  }
}
