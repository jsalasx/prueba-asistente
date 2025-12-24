import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ViewItem } from '../components/chat/chat.component';
import { AgentMcpService } from '../services/agent/agent-mcp-service';
import { UserStateService } from '../services/state/user-state-service';
import { SpeechToTextService } from '../services/stt/speech-to-text-service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  userInput: string = '';
  isLoading: boolean = false;

  userId: string = ""
  languagePlace: string = ""
  preguntasParaIaPorDefecto: string[] = [];
  labelAdmin: string = '';
  labelAssistant: string = '';
  transcribedText: string = '';
  isListening: boolean = false;
  isSpeechAvailable: boolean = false;
  private subscription?: Subscription;

  private textSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private errorSubscription?: Subscription;

  private userSubscription?: Subscription;
  private placeSubscription?: Subscription;

  constructor(
    private translate: TranslateService,
    private agentMcpService: AgentMcpService,
    private speechService: SpeechToTextService,
    private userStateService: UserStateService
  ) { }

  async ngOnInit(): Promise<void> {

    this.userId = this.userStateService.getUserId() || "";
    this.languagePlace = this.userStateService.getPlaceData()?.lenguaje || 'es';

    this.userSubscription = this.userStateService.userData$.subscribe(userData => {
      if (userData) {
        this.userId = userData.userId;
      }
    });

    this.placeSubscription = this.userStateService.placeData$.subscribe(placeData => {
      if (placeData) {
        this.languagePlace = placeData.lenguaje || 'es';
      }
    });

    this.subscription = this.translate.onLangChange.subscribe(() => {
      this.cargarPreguntas();
    });

    this.isSpeechAvailable = this.speechService.isAvailable();

    // Suscribirse al texto
    this.textSubscription = this.speechService.getText().subscribe(text => {
      this.transcribedText = text;
      this.userInput = text; // Actualizar el input
    });

    // Suscribirse al estado
    this.statusSubscription = this.speechService.getStatus().subscribe(status => {
      this.isListening = status;
    });

    // Suscribirse a errores
    this.errorSubscription = this.speechService.getErrors().subscribe(error => {
      console.error('Error de voz:', error);
      alert(`Error: ${error}`);
    });
  }

  private cargarPreguntas() {
    this.preguntasParaIaPorDefecto = [
      this.translate.instant('ASISTANT_TAB_MAIN.IA_QUICK_LINK_1'),
      this.translate.instant('ASISTANT_TAB_MAIN.IA_QUICK_LINK_2'),
      this.translate.instant('ASISTANT_TAB_MAIN.IA_QUICK_LINK_3'),
      this.translate.instant('ASISTANT_TAB_MAIN.IA_QUICK_LINK_4'),
      this.translate.instant('ASISTANT_TAB_MAIN.IA_QUICK_LINK_5'),
      this.translate.instant('ASISTANT_TAB_MAIN.IA_QUICK_LINK_6'),
    ];

    this.labelAdmin = this.translate.instant('ASISTANT_TAB_MAIN.LABEL_MSG_ADMINISTRATOR');
    this.labelAssistant = this.translate.instant('ASISTANT_TAB_MAIN.LABEL_MSG_ASSISTANT');
  }
  toggleListening() {
    if (this.isListening) {
      this.speechService.stopListening();
    } else {
      this.transcribedText = '';
      this.speechService.startListening(this.translate.getCurrentLang()); // o 'en-US' para inglés
    }
  }

  ngOnDestroy() {
    // Limpiar suscripción
    this.subscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.placeSubscription?.unsubscribe();
    this.textSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
  }



  messages: ViewItem[] = [];

  onSuggestionClick(pregunta: string) {
    console.log('Pregunta seleccionada:', pregunta);
    // Aquí puedes manejar la lógica cuando se hace clic
    this.userInput = pregunta;
    this.onSubmit();
  }

  onSubmit() {
    this.isLoading = true;

    if (this.userId === undefined || this.userId === null || this.userId.trim() === "") {
      console.error('User ID no está definido.');
      alert('Error: User ID no está definido.');
      this.isLoading = false;
      return;
    }

    if (this.userInput.trim()) {
      console.log('Mensaje:', this.userInput);
      this.enviarMensaje(this.userInput);
      const textoInput = this.userInput;
      this.messages = [...this.messages, { type: 'user', key: this.userId, message: textoInput, time: new Date().toISOString(), title: this.labelAdmin },
      { type: 'assistant', key: this.userId + '_resp', message: 'Esperando respuesta', time: new Date().toISOString(), title: this.labelAssistant, isLoading: true }];
      this.userInput = ''; // Limpiar
      this.isListening = false;
    } else {
      this.isLoading = false;
    }
  }
  enviarMensaje(mensaje: string) {
    // Tu lógica
    console.log('Enviando mensaje:', mensaje);
    this.agentMcpService.ask({
      question: mensaje,
      userId: this.userId,
      language: this.languagePlace,
    }).subscribe({
      next: (response) => {
        console.log('Respuesta de la IA:', response.answer);
        const msgFiltered = this.messages.filter(msg => !(msg.type === 'assistant' && msg.isLoading));
        this.messages = [...msgFiltered, { type: 'assistant', key: this.userId + '_resp_' + Date.now(), message: response.answer, time: new Date().toISOString(), title: this.labelAssistant, isLoading: false }];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al comunicarse con la IA:', error);
        this.isLoading = false;
      }
    });
  }

}
