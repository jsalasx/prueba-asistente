import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PlaceService } from './services/parse/place/place-service';
import { UserService } from './services/parse/user/user-service';
import { UserStateService } from './services/state/user-state-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService, private userService: UserService,
    private placeService: PlaceService,
    private userStateService: UserStateService,
    private platform: Platform,
    private swUpdate: SwUpdate
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.checkForUpdates();
  }

  checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      console.log('🔄 Service Worker habilitado');

      // Verificar actualizaciones cada 6 horas
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 6 * 60 * 60 * 1000);

      // Cuando hay una actualización disponible
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
            window.location.reload();
          }
        }
      });
    }
  }
  async initializeApp() {
    // Idiomas disponibles


    try {
      let url = new URLSearchParams(window.location.search);
      console.log("UURL" + url.toString());
      let userId = 'tFBdEUUaMe'//url.get('user'); //'7HZwsgb3ZW'
      let placeId = "bWCHeckDTt" //url.get('place'); //'sO6yzWDnHL'

      await this.userService.obtenerUsuario(userId);
      this.placeService.obtenerTienda(placeId).then(async place => {
        console.log("PLACE", place);
        const languagePlace = this.parseLanguageCode(place?.get('lenguaje') || 'es');
        console.log("Language Place:", languagePlace);
        this.translate.addLangs(['es', 'en', 'pr']);
        this.translate.setFallbackLang(languagePlace);
        this.translate.use(languagePlace).subscribe(() => {
          console.log(`Idioma establecido a ${languagePlace}`);
        });

        this.userStateService.setUserData({ userId: userId! });
        this.userStateService.setPlaceData({ placeId: placeId!, lenguaje: languagePlace });
      });

    } catch (error) {
      console.error("Error cargando datos:", error);
    }

  }

  parseLanguageCode(lang: string): string {
    const langAux = lang.toLowerCase();
    switch (langAux) {
      case 'es':
      case 'es-es':
        return 'es';
      case 'en':
      case 'en-us':
        return 'en';
      case 'pr':
      case 'pr-br':
      case 'pt':
      case 'br':
        return 'pr';
      default:
        return 'es'; // Idioma por defecto
    }
  }
}
