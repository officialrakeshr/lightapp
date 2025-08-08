import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  public color$ = new BehaviorSubject<string>('#000');
  public effect$ = new BehaviorSubject<string>('none');
  public binaryFlow$ = new BehaviorSubject<{ sequence: string, color: string, interval: number }>({ sequence: '', color: '#000', interval: 1000 });
  public location = inject(Location)
  constructor() {
    this.socket = io(`${window.location.protocol}//${window.location.hostname}:3000`, {
      reconnectionAttempts: 1,  // Try reconnecting 1 times
      reconnectionDelay: 2000   // Wait 2s between tries
    });
    this.socket.on('light', (data: any) => {
      this.color$.next(data.color);
      this.effect$.next(data.effect);
    });
    this.socket.on('binary', (data: any) => {
      this.binaryFlow$.next(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);

      // If reconnect fails completely, refresh page
      if (reason === 'io server disconnect') {
        // Server forced disconnect → no auto reconnect
        window.location.reload();
      }
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('❌ Reconnect failed — refreshing...');
      window.location.reload();
    });
  }

  emitLight(color: string, effect: string) {
    this.socket.emit('light', { color, effect });
  }
  emitBinaryFlow(sequence: string, color: string, interval: number) {
    this.socket.emit('binary', { sequence, color, interval });
  }

}