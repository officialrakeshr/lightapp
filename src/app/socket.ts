import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  public color$ = new BehaviorSubject<string>('#000');
  public effect$ = new BehaviorSubject<string>('none');
  public binaryFlow$ = new BehaviorSubject<{ sequence: string, color: string, interval: number }>({ sequence: '', color: '#000', interval: 1000 });

  constructor() {
    this.socket = io('http://144.24.145.186/:3000');
    this.socket.on('light', (data: any) => {
      this.color$.next(data.color);
      this.effect$.next(data.effect);
    });
    this.socket.on('binary', (data: any) => {
      this.binaryFlow$.next(data);
    });
  }

  emitLight(color: string, effect: string) {
    this.socket.emit('light', { color, effect });
  }
  emitBinaryFlow(sequence: string, color: string, interval: number) {
    this.socket.emit('binary', { sequence, color, interval });
  }
  
}