import { Component, OnInit } from "@angular/core";
import { SocketService } from "../socket";
import { CommonModule } from "@angular/common";
import NoSleep from 'nosleep.js';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@Component({
  selector: 'app-userview',
  standalone:true,
  imports:[CommonModule, BrowserAnimationsModule],
  template: `<div [ngStyle]="{ 'background-color': color }" class="full-screen" [ngClass]="effect">&nbsp;</div>`,
  styles: [`
    .full-screen {
      height:100vh;
      padding:0;
      margin:0;
    }
    .blink {
      animation: blink 1s infinite;
    }
    .pulse {
      animation: pulse 2s infinite;
    }
    .fade {
      animation: fade 3s infinite;
    }
    .flash {
      animation: flash 0.5s infinite;
    }
    .wave {
      animation: wave 2s infinite linear;
    }
    .strobe {
      animation: strobe 100ms infinite;
    }

    @keyframes strobe {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes blink {
      0%, 50%, 100% { opacity: 1; }
      25%, 75% { opacity: 0; }
    }

    @keyframes fade {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }

    @keyframes flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    @keyframes wave {
      0% { background-color: red; }
      25% { background-color: yellow; }
      50% { background-color: green; }
      75% { background-color: blue; }
      100% { background-color: red; }
    }
  `]
})
export class Userview implements OnInit {
  color = '#000';
  effect = 'none';
  sequenceTimer :any =  null;
  currentColor: string = '';

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    document.documentElement.requestFullscreen();
    const noSleep = new NoSleep();
    noSleep.enable(); 
    this.socketService.color$.subscribe(c =>{
       this.color = c;
    });
    this.socketService.effect$.subscribe(e => {
      this.effect = e;
      clearInterval(this.sequenceTimer);
    });
    this.socketService.binaryFlow$.subscribe(({ sequence, color, interval }) => {
      if (this.sequenceTimer) clearInterval(this.sequenceTimer);
      this.effect = 'none';
      let index = 0;
      const bits = sequence.split('');

      this.sequenceTimer = setInterval(() => {
        if (index >= bits.length) {
          clearInterval(this.sequenceTimer);
          this.color = '#000000';
          return;
        }
        this.color = bits[index] === '1' ? color : '#000000';
        index++;
      }, interval);
    });
  }
}
