import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDto, SignupDto } from '../types/usertypes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private baseUrl = 'http://localhost:5262/api/Auth';
  constructor(private readonly http: HttpClient) {}

  public loginUser(loginDto: LoginDto): Observable<object> {
    return this.http.post(`${this.baseUrl}/login`, loginDto);
  }
  public registerUser(signupDto: SignupDto): Observable<object> {
    const dto = {
      Email: signupDto.email,
      Username: signupDto.username,
      FirstName: signupDto.firstName,
      LastName: signupDto.lastName,
      Password: signupDto.password
    }
    return this.http.post(`${this.baseUrl}/register`, signupDto);
  }
}
