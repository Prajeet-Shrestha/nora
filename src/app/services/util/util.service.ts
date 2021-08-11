import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor() {}

  IsAuthenticated(): boolean {
    const user = this.getLocalStorage('user');
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  setLocalStorage(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setUserInLocalStorage(userphone, otp) {
    const user = {
      phone: userphone,
      otp: otp,
    };
    this.setLocalStorage('user', user);
  }

  async _action(aiMessage) {
    let returnValue = {
      response: '',
      action: {
        type: 'NONE',
        link: '',
      },
    };
    let actionString = aiMessage.match(/([(][a][c][t][i][o][n][)].+[(][/][a][c][t][i][o][n][)])/g);
    console.log(actionString);

    if (actionString) {
      console.log(aiMessage.split('(action)'));
      returnValue.response = aiMessage.split('(action)')[0];
      let actionLink = actionString[0].match(/([(][l][i][n][k][)].+[(][/][l][i][n][k][)])/g)[0];
      console.log(actionLink);
      if (actionLink) {
        let link = actionLink.split('(link)')[1].split('(/link)')[0];
        console.log(link);
        returnValue.action.type = 'LINK';
        returnValue.action.link = link;
      }
    } else {
      console.log(aiMessage);
      returnValue.response = aiMessage;
    }
    console.log(returnValue);

    return returnValue;
  }

  _checkIsPhoneNumber(number) {
    let parsedNumber = '';
    let isValid = false;
    let stringList = number.split(' ');
    console.log(stringList);
    number.split(' ').map((data) => {
      if (parseInt(data, 10)) {
        console.log(data);
        parsedNumber = data;
        if (parsedNumber.length == 10) {
          isValid = true;
        }
      }
    });
    console.log('FOUND NUMBER', parsedNumber);
    return parsedNumber.length >= 1 ? (isValid ? parsedNumber : 'INVALID') : null;
  }

  findMoneyInText(text) {
    console.log(text);
    let exp = text.match(/([0-9]*)/g);
    let returnVal = 0;
    exp.map((data) => {
      if (data.length >= 1) {
        returnVal = parseFloat(data);
      }
    });
    return returnVal;
  }

  findPinCodeInText(text) {
    console.log(text);
    let exp = text.match(/([0-9]*)/g);
    let returnVal = 0;
    exp.map((data) => {
      if (data.length <= 4 && data.length >= 0) {
        returnVal = parseFloat(data);
      }
    });
    return returnVal;
  }
}
