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
      typeof usuario == 'string'
        ? tienda.equalTo('objectId', usuario)
        : tienda.equalTo('user', usuario);
      let resultado_tienda: any = await tienda.first();

      if (resultado_tienda) {
        return resultado_tienda;
      }
    } catch (e: any) {
      console.log(e.message);
    }
    return;
  }

  async obtenerTiendaByUserId(userId: string): Promise<Parse.Object | null> {
    try {
      // Query sobre Place
      const query = new Parse.Query('Place');

      // Crear el puntero al usuario
      const userPointer = new Parse.User();
      userPointer.id = userId;

      // Filtrar por puntero
      query.equalTo('user', userPointer);

      // Obtener el primer resultado
      const place = await query.first();

      return place ?? null;
    } catch (error) {
      console.error('Error obteniendo Place por userId:', error);
      throw error;
    }
  }
}
