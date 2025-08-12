import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Loginservice } from '../login/loginservice/loginservice';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet,CommonModule, MatSidenavModule, MatIcon, CommonModule,
    MatExpansionModule, MatToolbarModule, MatButtonModule, MatListModule,RouterModule],

  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  protected readonly title = signal('AFT_Billing_App');
  public isMobile = false;
  public sidenavOpened = false;

  constructor(private loginService: Loginservice, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 900;
    if (!this.isMobile) {
      this.sidenavOpened = false;
    }
    this.cdr.detectChanges();
  }

  logout() {
    console.log('Logout clicked');
  }
}
