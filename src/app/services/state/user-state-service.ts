import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserData {
  userId: string;
}

export interface PlaceData {
  placeId: string;
  lenguaje?: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserStateService {

  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  private placeDataSubject = new BehaviorSubject<PlaceData | null>(null);

  userData$ = this.userDataSubject.asObservable();
  placeData$ = this.placeDataSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  setUserId(userId: string) {
    const currentData = this.userDataSubject.value || { userId: '' };
    this.saveToStorage('userId', userId);
    this.userDataSubject.next({ ...currentData, userId });
  }

  getUserId(): string | null {
    return this.userDataSubject.value ? this.userDataSubject.value.userId : null;
  }

  setPlaceId(placeId: string) {
    const currentData = this.placeDataSubject.value || { placeId: '' };
    this.saveToStorage('placeId', placeId);
    this.placeDataSubject.next({ ...currentData, placeId });
  }
  getPlaceId(): string | null {
    return this.placeDataSubject.value ? this.placeDataSubject.value.placeId : null;
  }

  setUserData(data: UserData) {
    this.saveToStorage('userData', data);
    this.userDataSubject.next(data);
  }

  getUserData(): UserData | null {
    return this.userDataSubject.value;
  }

  setPlaceData(data: PlaceData) {
    this.saveToStorage('placeData', data);
    this.placeDataSubject.next(data);
  }

  getPlaceData(): PlaceData | null {
    return this.placeDataSubject.value;
  }

  clearState() {
    this.userDataSubject.next(null);
    this.placeDataSubject.next(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('placeId');
    localStorage.removeItem('userData');
    localStorage.removeItem('placeData');
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const userId = localStorage.getItem('userId');
      const placeId = localStorage.getItem('placeId');
      const userData = localStorage.getItem('userData');
      const placeData = localStorage.getItem('placeData');

      if (userData) {
        this.userDataSubject.next(JSON.parse(userData));
      } else if (userId) {
        this.userDataSubject.next({ userId: JSON.parse(userId) });
      }

      if (placeData) {
        this.placeDataSubject.next(JSON.parse(placeData));
      } else if (placeId) {
        this.placeDataSubject.next({ placeId: JSON.parse(placeId) });
      }
    } catch (error) {
      console.error('Error cargando desde localStorage:', error);
    }
  }

}
