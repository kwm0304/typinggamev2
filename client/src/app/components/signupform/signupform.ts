import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignupDto } from '../../types/usertypes';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-signupform',
  imports: [FontAwesomeModule, FormsModule],
  templateUrl: './signupform.html',
  styleUrl: './signupform.css',
})
export class Signupform {
  userInfo: SignupDto = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  }
  signupSubmit = output<SignupDto>(); 
  constructor(private faIconLibrary: FaIconLibrary) {
    this.faIconLibrary.addIcons(faUserPlus);
  }
  onSubmit() {
    this.signupSubmit.emit(this.userInfo);

  }
  submitSignup() {
    this.signupSubmit.emit(this.userInfo);
  }
}
