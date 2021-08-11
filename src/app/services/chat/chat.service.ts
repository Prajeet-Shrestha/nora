import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // # examplePayload_Chat = {
  //   #     message:''
  //   # }

  //   # examplePayload_auth = {
  //   #     phoneno:''
  //   #     otp:''
  //   # }

  //   # examplePayload_withdraw = {
  //   #     phoneno:'',
  //   #     amount:'', # float
  //   #     purpose: "" # payment remarks
  //   # }

  //   # examplePayload_deposit = {
  //   #       phoneno:'',
  //   #       amount:'', # float
  //   #       purpose: "" # payment remarks
  //   # }

  //   # examplePayload_checkbalance = {
  //   #     phoneno:''
  //   # }
  constructor(private _http: HttpService) {}
  url = {
    chat: 'http://127.0.0.1:5000/chat',
    deposit: 'http://127.0.0.1:5000/add_deposit',
    check: 'http://127.0.0.1:5000/check_balance',
    auth: 'http://127.0.0.1:5000/authenticate',
    withdraw: 'http://127.0.0.1:5000/add_withdraw',
  };
  getChatResponse(message) {
    return this._http.post(
      this.url.chat,
      {
        message: message,
      },
      null
    );
  }

  chatTaskDeposit(phoneNumber: string, amount: number, purpose: string) {
    const payload = {
      phoneno: phoneNumber,
      amount: amount + 0.2,
      purpose: purpose,
    };
    return this._http.post(this.url.deposit, payload, null);
  }

  chatTaskWithdraw(phoneNumber: string, amount: number, purpose: string) {
    const payload = {
      phoneno: phoneNumber,
      amount: amount + 0.2,
      purpose: purpose,
    };
    console.log(payload);
    return this._http.post(this.url.withdraw, payload, null);
  }

  chatTaskAuth(OTP: string, phoneNumber: string) {
    const payload = {
      phoneno: phoneNumber,
      otp: OTP,
    };
    return this._http.post(this.url.auth, payload, null);
  }

  chatTaskCheckBalance(phoneNumber: string) {
    const payload = {
      phoneno: phoneNumber,
    };
    return this._http.post(this.url.check, payload, null);
  }

  processText(text: string) {
    let normalize = text.normalize('NFC');
    console.log(text);
    // let removedStopWords = this.remove_stopwords(text);
    let removedSymbols = normalize.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ');
    console.log(removedSymbols);
    return removedSymbols;
  }
  intToFloat(num, decPlaces) {
    return num.toFixed(decPlaces);
  }
}
