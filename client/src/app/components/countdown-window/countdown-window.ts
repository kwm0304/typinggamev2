import { Component, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-countdown-window',
  imports: [],
  templateUrl: './countdown-window.html',
  styleUrl: './countdown-window.css',
})
export class CountdownWindow {
  secondsRemaining: number = 5;
  closeInstructions = output<boolean>();

  startCountdown() {
    const startTime = Date.now();
    const countdownInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      this.secondsRemaining = 5 - elapsed;
      if (this.secondsRemaining <= 0) {
        clearInterval(countdownInterval);
        this.closeInstructionWindow();
      }
    }, 100);
  }

  closeInstructionWindow() {
    this.closeInstructions.emit(true);
  }
}
