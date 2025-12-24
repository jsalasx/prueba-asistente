import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root',
})
export class PlaceService {

  constructor() {}

  async obtenerTienda(usuario: any) {
    try {
      let tienda = new Parse.Query('Place');
      (typeof usuario == 'string' ? tienda.equalTo('objectId', usuario) : tienda.equalTo('user', usuario));
      let resultado_tienda: any = await tienda.first();

      if (resultado_tienda) {
        return resultado_tienda;
      }
    }
    catch (e: any) {
      console.log(e.message);
    }
    return;
  }

}
