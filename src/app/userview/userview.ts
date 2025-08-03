import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
import { SocketService } from "../socket";
import { CommonModule } from "@angular/common";
import NoSleep from 'nosleep.js';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
declare var bootstrap: any;
@Component({
  selector: 'app-userview',
  standalone: true,
  imports: [CommonModule],
  template: `<div [ngStyle]="{ 'background-color': color }" class="full-screen" [ngClass]="effect">&nbsp;</div>
<!-- Modal -->
<div class="modal" id="myModal" #myModal tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content carnival-modal text-white text-center">

      <!-- Header with logos -->
      <div class="modal-header justify-content-center border-0 position-relative bg-carnival">
        <img src="bash_carnival_logo.png" alt="Event Logo" class="event-logo">
      </div>

      <!-- Body -->
      <div class="modal-body py-4 bg-carnival">
        <h2 class="carnival-title mb-3">🎉 Welcome to Carnival Bash 2025 🎉</h2>
        <p class="lead">Get ready for a spectacular celebration filled with fun, music, and surprises!</p>
      </div>

      <!-- Footer with action and coordinator logo -->
      <div class="modal-footer justify-content-between bg-carnival-footer">
        <img src="rhythm_logo.png" alt="Coordinator" class="coordinator-logo">
        <div>
          <button type="button" class="btn btn-outline-dark me-2" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-warning" (click)="toggleFullScreen()">Fullscreen Mode</button>
        </div>
      </div>

    </div>
  </div>
</div>


  
  `,
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

    .carnival-modal {
  background: linear-gradient(135deg, #ff4081, #ffeb3b);
  border: 5px solid #fff;
  box-shadow: 0 0 20px rgba(255, 64, 129, 0.6);
  font-family: "Share Tech", sans-serif;
}

.bg-carnival {
  background: linear-gradient(to right, #1c034d, #ca1cdf);
}

.bg-carnival-footer {
  background: #ffff;
  padding: 1rem;
}
.event-logo{
 background: white;
    border-radius: 40px;
}
.event-logo, .coordinator-logo {
  height: 60px;
  object-fit: contain;
 
}

.carnival-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px #000;
}

  `]
})

export class Userview implements OnInit, AfterViewInit {
  color = '#000';
  effect = 'none';
  sequenceTimer: any = null;
  currentColor: string = '';
  private destroyRef = inject(DestroyRef);
  @ViewChild('myModal', { static: false }) myModal!: ElementRef;
  modal: any;

  openModal() {
    this.modal = new bootstrap.Modal(this.myModal?.nativeElement);
    this.modal.show();
  }

  constructor(private socketService: SocketService) { }
  ngAfterViewInit(): void {
    this.openModal();
  }

  ngOnInit(): void {
    const noSleep = new NoSleep();
    noSleep.enable();
    this.socketService.color$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(c => {
      this.color = c;
    });
    this.socketService.effect$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(e => {
      this.effect = e;
      clearInterval(this.sequenceTimer);
    });
    this.socketService.binaryFlow$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ sequence, color, interval }) => {
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
  toggleFullScreen() {
    this.modal.hide();
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

}
