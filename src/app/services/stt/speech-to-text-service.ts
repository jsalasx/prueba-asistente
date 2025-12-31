import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Definir tipos para TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: any) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}


@Injectable({
  providedIn: 'root',
})
export class SpeechToTextService {
  private recognition: ISpeechRecognition | null = null;
  private isListening = false;

  private silenceTimeout: any = null;
  private silenceDelay = 3000; // 3 segundos de silencio

  private silenceInterval: any = null;
  private silenceDeadline = 0;

  private textSubject = new Subject<string>();
  private errorSubject = new Subject<string>();
  private statusSubject = new Subject<boolean>();
  private finishedSpeakingSubject = new Subject<string>();

  private silenceRemainingMsSubject = new Subject<number>();
  private silenceProgressSubject = new Subject<number>();

  private lastFinalTranscript = '';

  private lastEmittedText = '';
  private lastResetAt = 0;
  private resetMinIntervalMs = 500; // evita resets excesivos

  private lastText = '';
  private alreadyEmitted = false;

  private finalTextTranscribed = '';


  constructor() {
    this.initRecognition();

  }

  private initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition no está soportado en este navegador');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      if (!currentText) return;


      this.lastText = currentText
      
      // Emitir texto
      this.textSubject.next(currentText);
      //console.log("Timestamp evento:", event.timeStamp);
      //console.log('Texto transcrito:', currentText);
      //console.log('Final hasta ahora:', this.finalTextTranscribed);
      // Guardar final si llegó
      if (finalTranscript.trim()) {
        this.lastFinalTranscript = finalTranscript.trim();
        this.finalTextTranscribed += finalTranscript.trim() + ' ';
      }

      // ✅ SOLO resetear si realmente cambió el texto
      if (currentText !== this.lastEmittedText) {
        console.log('Resetear contador de silencio debido a nuevo texto');
        this.lastEmittedText = currentText;

        // ✅ throttle anti-spam de resets
        const now = Date.now();
        if (now - this.lastResetAt > this.resetMinIntervalMs) {
          console.log('Resetear contador de silencio');
          this.lastResetAt = now;
          this.resetSilenceCountdown();
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error de reconocimiento de voz:', event.error);
      this.errorSubject.next(event.error);
      this.clearSilenceTimers();
      this.isListening = false;
      this.statusSubject.next(false);
    };

    this.recognition.onend = () => {
      console.log('Reconocimiento de voz finalizado');
      const textToSend = (this.lastFinalTranscript || this.lastText || '').trim();

      // ✅ fallback: si el navegador cortó antes de tu timeout, igual emites
      if (!this.alreadyEmitted && textToSend) {
        this.alreadyEmitted = true;
        this.finishedSpeakingSubject.next(textToSend);
      }

      this.clearSilenceTimers();
      this.isListening = false;
      this.statusSubject.next(false);
    };
  }

  private resetSilenceCountdown() {

    if (this.silenceTimeout) {
      console.log("* Intervalo Reiniciado *");
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    this.silenceTimeout = setTimeout(() => {
      console.log('Silencio detectado, usuario terminó de hablar');

      const textToSend = (this.lastFinalTranscript || this.lastText || '').trim();

      if (!this.alreadyEmitted && textToSend) {
        this.alreadyEmitted = true;
        this.finishedSpeakingSubject.next(this.finalTextTranscribed.trim());
      }

      this.stopListening();
    }, this.silenceDelay);



    // Si no hay nada final todavía, igual mostramos countdown,
    // pero cuando llegue a 0 validaremos si hay lastFinalTranscript.
    this.silenceDeadline = Date.now() + this.silenceDelay;

    // Emitimos estado inicial
    this.silenceRemainingMsSubject.next(this.silenceDelay);
    this.silenceProgressSubject.next(0);

    // Interval para UI (cada 100ms)
    this.silenceInterval = setInterval(() => {
      const remaining = Math.max(0, this.silenceDeadline - Date.now());
      this.silenceRemainingMsSubject.next(remaining);
      this.silenceProgressSubject.next(1 - remaining / this.silenceDelay);
      if (remaining <= 0) this.clearSilenceTimers();
    }, 100);
  }

  private clearSilenceTimers() {
    
    if (this.silenceInterval) {
      clearInterval(this.silenceInterval);
      this.silenceInterval = null;
    }
  }

  // Limpiar timeout
  private clearSilenceTimeout() {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  startListening(lang: string = 'es-ES') {
    if (!this.recognition) {
      this.errorSubject.next('Speech Recognition no disponible');
      return;
    }

    if (this.isListening) {
      return;
    }
    this.finalTextTranscribed = '';
    this.lastFinalTranscript = '';
    this.lastText = '';
    this.alreadyEmitted = false;
    this.clearSilenceTimers();

    this.recognition.lang = lang;
    this.recognition.start();
    this.isListening = true;
    this.statusSubject.next(true);
  }

  stopListening() {
    if (!this.recognition || !this.isListening) {
      return;
    }
    this.clearSilenceTimeout()
    this.clearSilenceTimers();
    this.recognition.stop();
    this.isListening = false;
    this.statusSubject.next(false);

    this.silenceRemainingMsSubject.next(0);
    this.silenceProgressSubject.next(1);

    this.textSubject.next(this.finalTextTranscribed.trim());
  }

  getText(): Observable<string> {
    return this.textSubject.asObservable();
  }

  getErrors(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  getStatus(): Observable<boolean> {
    return this.statusSubject.asObservable();
  }

  // Nuevo Observable para detectar cuando terminó de hablar
  getFinishedSpeaking(): Observable<string> {
    return this.finishedSpeakingSubject.asObservable();
  }

  // 👇 NUEVOS
  getSilenceRemainingMs(): Observable<number> {
    return this.silenceRemainingMsSubject.asObservable();
  }
  getSilenceProgress(): Observable<number> {
    return this.silenceProgressSubject.asObservable();
  }

  // Configurar el delay de silencio (en milisegundos)
  setSilenceDelay(delay: number) {
    this.silenceDelay = delay;
  }

  isAvailable(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}
