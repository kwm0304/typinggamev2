import { Component, input, OnInit } from '@angular/core';
import { AlertDTO, AlertType } from '../../types/usertypes';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert implements OnInit{
  type = input<AlertType>('success');
  message = input<string>('');
  ngOnInit(): void {
    
  }
}
