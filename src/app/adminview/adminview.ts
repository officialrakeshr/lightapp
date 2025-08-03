import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../socket';
import { guess } from 'web-audio-beat-detector';

@Component({
  selector: 'app-adminview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">
      <h2>🎛 Admin Light Controller</h2>

      <div class="form-group">
        <label>🎨 Color:</label>
        <input [(ngModel)]="color" type="color">
      </div>

      <div class="form-group">
        <label>💡 Effect:</label>
        <div class="radio-group">
          <label><input type="radio" name="effect" value="none" [(ngModel)]="effect"> None</label>
          <label><input type="radio" name="effect" value="blink" [(ngModel)]="effect"> Blink</label>
          <label><input type="radio" name="effect" value="fade" [(ngModel)]="effect"> Fade</label>
          <label><input type="radio" name="effect" value="wave" [(ngModel)]="effect"> Wave</label>
          <label><input type="radio" name="effect" value="strobe" [(ngModel)]="effect"> Strobe</label>
        </div>
      </div>

      <button class="btn" (click)="sendCommand()">🚀 Send</button>

      <hr>

      <div>
        <h3>🎼 Binary Light Sequence</h3>

        <div class="form-group">
          <label>Binary Pattern (e.g., 0101011):</label><br>
          <input [(ngModel)]="binarySequence" style="width: 100%">
        </div>

        <div class="form-group">
          <label>Interval (ms):</label>
          <input type="number" [(ngModel)]="interval" min="100" step="100">
        </div>

        <button class="btn" (click)="startBinaryFlow()">🎬 Start Flow</button>
      </div>
       <hr>
       <div>
        <h3>📂 Upload MP3 for Beat Detection</h3>
        <input type="file" accept=".mp3" (change)="onFileSelected($event)">
        <div *ngIf="uploading">Analyzing... ⏳</div>
        <div *ngIf="binarySequence && !uploading">✅ Sequence Generated!</div>
      </div>
    </div>
  `,
  styles: [`
    .admin-panel {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      font-family: 'Segoe UI', sans-serif;
      background: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    input[type="color"], input[type="text"], input[type="number"] {
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    .radio-group label {
      margin-right: 1.2rem;
      font-size: 0.95rem;
    }
    .btn {
      padding: 0.6rem 1.2rem;
      background: #007bff;
      border: none;
      color: white;
      font-size: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
      margin-top:5px;
      margin-bottom:5px;
    }
    .btn:hover {
      background: #0056b3;
    }
  `]
})
export class Adminview {
  color = '#ffffff';
  effect = 'none';
  binarySequence = '';
  interval = 250;
  uploading = false;
  autoDetectedInterval = true;
  socketService: SocketService = inject(SocketService);

  sendCommand() {
    this.socketService.emitLight(this.color, this.effect);
  }

  startBinaryFlow() {
    if (!this.binarySequence.match(/^[01]+$/)) {
      alert('Please enter a valid binary sequence (only 0 and 1)');
      return;
    }
    this.socketService.emitBinaryFlow(this.binarySequence, this.color, this.interval);
  }

 async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;

    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    try {
      const { bpm, offset } = await guess(audioBuffer);
      const beatsPerSecond = bpm / 60;
      const beatInterval = 1000 / beatsPerSecond;
      const sequenceLength = Math.ceil(audioBuffer.duration * 1000 / this.interval);
      const binaryArray = Array(sequenceLength).fill('0');

      for (let i = 0; i * beatInterval + offset * 1000 < audioBuffer.duration * 1000; i++) {
        const time = i * beatInterval + offset * 1000;
        const index = Math.floor(time / this.interval);
        if (index < binaryArray.length) {
          binaryArray[index] = '1';
        }
      }

      this.binarySequence = binaryArray.join('');
    } catch (err) {
      console.error('Beat detection failed:', err);
      alert('Beat detection failed. Please try another file.');
    }

    this.uploading = false;
  }
}
