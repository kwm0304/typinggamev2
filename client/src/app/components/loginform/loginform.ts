import { Component, output } from '@angular/core';
import { LoginDto } from '../../types/usertypes';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserPlus, faArrowRightToBracket
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-loginform',
  imports: [FontAwesomeModule, FormsModule],
  templateUrl: './loginform.html',
  styleUrl: './loginform.css',
})
export class Loginform {
  githubLogin = output<void>();
  googleLogin = output<void>();
  userInfo: LoginDto = {
    email: '',
    password: '',
    rememberMe: false
  }
  loginSubmit = output<LoginDto>();
constructor(private faIconLibrary: FaIconLibrary) {
    this.faIconLibrary.addIcons(faUserPlus, faArrowRightToBracket, faGithub, faGoogle);
  }
  submitLogin(){
    this.onSubmit();
  }
  onSubmit() {
    this.loginSubmit.emit(this.userInfo);
  }
  signInWithGoogle() {
    this.googleLogin.emit();
  }
  signInWithGithub() {
  this.githubLogin.emit();
}
}
