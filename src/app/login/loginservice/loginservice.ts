import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Loginservice {
  // private loggedInSubject = new BehaviorSubject<boolean>(false);
  // loggedIn$ = this.loggedInSubject.asObservable();

  // getLoginStatus(): boolean {
  //   return this.loggedInSubject.value;
  // }
  
  // setLoginStatus(status: boolean) {
  //   this.loggedInSubject.next(status);
  // }
}
