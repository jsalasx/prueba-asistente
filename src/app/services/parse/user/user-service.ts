import { Injectable } from '@angular/core';
import * as Parse from 'parse';
@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor() {}
  async obtenerUsuario(usuario: any) {
    try {
      let _usuario = await (new Parse.Query('User')).get(usuario);
      console.log("_USUARIO", _usuario);
      if (_usuario) {
        return _usuario;
      }
    }
    catch (e: any) {
      console.log(e.message);
    }
    return;
  }
}
