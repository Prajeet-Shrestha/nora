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
    transfer: 'http://127.0.0.1:5000/transfer_balance',
    saveLogs: 'http://127.0.0.1:5000/save_chat_logs',
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

  chatTaskDeposit(phoneNumber: string, amount: number, purpose: string, pin) {
    const payload = {
      phoneno: phoneNumber,
      amount: amount + 0.2,
      purpose: purpose,
      otp: pin,
    };
    return this._http.post(this.url.deposit, payload, null);
  }

  chatTaskWithdraw(phoneNumber: string, amount: number, purpose: string, pin) {
    const payload = {
      phoneno: phoneNumber,
      amount: amount + 0.2,
      purpose: purpose,
      otp: pin,
    };
    console.log(payload);
    return this._http.post(this.url.withdraw, payload, null);
  }
  chatTaskTransfer(senderPhoneNumber: string, amount: number, recipient: any, pin) {
    const payload = {
      phoneno: senderPhoneNumber.toString(),
      otp: pin,
      amount: amount + 0.2,
      transferto: recipient.toString(),
      purpose: '',
    };
    console.log(payload);
    return this._http.post(this.url.transfer, payload, null);
  }

  chatTaskAuth(OTP: string, phoneNumber: string) {
    const payload = {
      phoneno: phoneNumber,
      otp: OTP,
    };
    console.log(payload);
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

  saveLogs(data) {
    const payLoad = {
      chatLogs: data,
    };
    return this._http.post(this.url.saveLogs, payLoad, null);
  }
}
