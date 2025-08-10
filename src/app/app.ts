import { Component, HostListener, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { Loginservice } from './login/loginservice/loginservice';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports:[LoginComponent],
  styleUrl: './app.css'
})
export class App  {
  
}
