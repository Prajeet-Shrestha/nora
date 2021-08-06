import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private _http: HttpService) {}
  url = '';
  getChatResponse(message) {
    return this._http.post(
      this.url,
      {
        message: message,
      },
      null
    );
  }
}
