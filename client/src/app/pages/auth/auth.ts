import { Component, OnInit } from '@angular/core';
import { Signupform } from '../../components/signupform/signupform';
import { Loginform } from '../../components/loginform/loginform';
import { HomeService } from '../../services/home.service';
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-auth',
  imports: [Signupform, Loginform],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit{
  isLoggedIn: boolean = false;
  userName: string = '';
  constructor(private readonly homeService: HomeService, private readonly alertService: AlertService, private readonly userService: UserService) {}
  ngOnInit(): void {
    
  }
  onSignupReceived(signupData: any) {
    console.log('Signup data received in Auth component:', signupData);
    // Handle the signup data, e.g., send it to a service for processing
    this.homeService.registerUser(signupData).subscribe(response => {
      console.log('Signup response:', response);
      this.userService.setUser(response);
      this.alertService.show('Signup successful!', 'success');
    }, (error) => {
      this.alertService.show(`Signup failed: ${error.message}`, 'error');
    });
  }
  logout() {
    this.userService.logout();
    this.isLoggedIn = false;
    this.alertService.show('Logged out successfully!', 'success');
  }
  onLoginReceived(loginData: any) {
    console.log('Login data received in Auth component:', loginData);
    // Handle the login data, e.g., send it to a service for authentication
    this.homeService.loginUser(loginData).subscribe(response => {
      console.log('Login response:', response);
      this.userService.setUser(response);
      this.isLoggedIn = true;
      this.userName = this.userService.username();
      this.alertService.show('Login successful!', 'success');
    }, (error) => {
      this.alertService.show(`Login failed: ${error.message}`, 'error');
    });
  }
}
