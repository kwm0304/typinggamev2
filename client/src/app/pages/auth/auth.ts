import { Component, OnInit } from '@angular/core';
import { Signupform } from '../../components/signupform/signupform';
import { Loginform } from '../../components/loginform/loginform';

@Component({
  selector: 'app-auth',
  imports: [Signupform, Loginform],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit{


  ngOnInit(): void {
    
  }
  onSignupReceived(signupData: any) {
    console.log('Signup data received in Auth component:', signupData);
    // Handle the signup data, e.g., send it to a service for processing
  }
  onLoginReceived(loginData: any) {
    console.log('Login data received in Auth component:', loginData);
    // Handle the login data, e.g., send it to a service for authentication
  }
}
