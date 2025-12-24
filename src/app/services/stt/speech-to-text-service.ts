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

  private textSubject = new Subject<string>();
  private errorSubject = new Subject<string>();
  private statusSubject = new Subject<boolean>();

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
    this.recognition.continuous = true; // Continuar escuchando
    this.recognition.interimResults = true; // Resultados parciales
    this.recognition.lang = 'es-ES'; // Idioma español
    this.recognition.maxAlternatives = 1;

    // Evento cuando se recibe texto
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

      // Emitir el resultado final o parcial
      this.textSubject.next(finalTranscript || interimTranscript);
    };

    // Evento de error
    this.recognition.onerror = (event: any) => {
      console.error('Error de reconocimiento de voz:', event.error);
      this.errorSubject.next(event.error);
      this.isListening = false;
      this.statusSubject.next(false);
    };

    // Evento cuando termina
    this.recognition.onend = () => {
      this.isListening = false;
      this.statusSubject.next(false);
    };
  }

  // Iniciar reconocimiento
  async startListening(lang: string = 'es-ES') {
    if (!this.recognition) {
      this.errorSubject.next('Speech Recognition no disponible');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      // Solicitar permisos explícitamente
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detener el stream inmediatamente (solo necesitábamos el permiso)
      stream.getTracks().forEach(track => track.stop());

      // Ahora iniciar el reconocimiento
      this.recognition.lang = lang;
      this.recognition.start();
      this.isListening = true;
      this.statusSubject.next(true);

    } catch (error: any) {
      console.error('Error al solicitar permiso de micrófono:', error);
      let errorMsg = 'No se pudo acceder al micrófono';

      if (error.name === 'NotAllowedError') {
        errorMsg = 'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en la configuración del navegador.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'No se detectó ningún micrófono en tu dispositivo.';
      }

      this.errorSubject.next(errorMsg);
    }
  }

  // Detener reconocimiento
  stopListening() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    this.recognition.stop();
    this.isListening = false;
    this.statusSubject.next(false);
  }

  // Observable para recibir texto
  getText(): Observable<string> {
    return this.textSubject.asObservable();
  }

  // Observable para recibir errores
  getErrors(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  // Observable para el estado (escuchando o no)
  getStatus(): Observable<boolean> {
    return this.statusSubject.asObservable();
  }

  // Verificar si está disponible
  isAvailable(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Obtener estado actual
  getIsListening(): boolean {
    return this.isListening;
  }
}
