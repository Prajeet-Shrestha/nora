import { Component, ViewChild, AfterViewInit } from '@angular/core';
import Speech from './services/speech.js';
import { ChatService } from '../app/services/chat/chat.service';
import { LevelingService } from './services/leveling/leveling.service';
import { emotionImg } from '../app/services/exports/emotions-img';
import { UtilService } from './services/util/util.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('aiChatCloud') aiChatCloud;
  @ViewChild('aiAvatar') aiAvatar;

  title = 'nora';
  cloudDialogBox = "I hope you're taking good care of yourself!";
  chatObjects = [
    {
      type: 'ai',
      message: 'Hello, I am Nora, Your Banking Assistance.',
      date: 0,
    },
  ];
  chatMode = {
    normal: true,
    banking: {
      state: false,
      withdraw: false,
      deposit: false,
      checkBalance: false,
      checkIPO: false,
    },
  };
  AIEmotion = {
    normal: true,
    happy: false,
    sad: false,
    worried: true,
  };
  tags = ['task_add_withdraw', 'task_add_deposit', 'chat_goodbye', 'chat_greetings'];
  loading: boolean = false;
  nora = {
    level: 1,
    xp: 10,
    mood: 'Sad',
  };
  ModuleSpeech;
  constructor(private _chat: ChatService, private _level: LevelingService, private utils: UtilService) {}

  ngAfterViewInit() {
    this.ModuleSpeech = new Speech();
    this.showCloudText('Hello, I am Nora.');
    this._level.___init___();
    this._level.publicCurrentAI.subscribe((data) => {
      if (this.nora.level < data['level']) {
        this.showCloudText('yayy, I am leveling up!');
      }
      this.nora.level = data['level'];

      this.nora.xp = data['xp'];
      this.nora.mood = data['emotion'];
    });

    this.changeAIEmotion('normal');
  }

  showCloudText(text) {
    this.cloudDialogBox = text;
    this.toggleChatCloud();
  }

  toggleChatCloud() {
    let that = this;
    console.log(that.aiChatCloud.nativeElement.classList);
    if (that.aiChatCloud.nativeElement.classList.length >= 2) {
      that.aiChatCloud.nativeElement.classList.remove('hide-opacity');
      setTimeout(function () {
        that.aiChatCloud.nativeElement.classList.add('hide-opacity');
      }, 5000);
    } else {
      setTimeout(function () {
        that.aiChatCloud.nativeElement.classList.add('hide-opacity');
      }, 5000);
    }
  }

  speech = false;
  toggleSpeech() {
    this.speech = this.speech ? false : true;
    if (this.speech) {
      this.ModuleSpeech.start();
    } else {
      this.ModuleSpeech.stop();
    }
  }

  @ViewChild('chatInput') chatInput;
  addUserMessage(value) {
    console.log(value);
    let that = this;
    let responseData = {
      intent: '',
      response: '',
    };
    if (value.length >= 1) {
      that._level.addXp(5);

      this.chatObjects.push({
        type: 'user',
        message: value,
        date: new Date().getSeconds(),
      });
      this.loading = true;
      if (this.chatMode.banking.withdraw) {
        if (this.TaskSequenceState.withdraw.current == 1) {
          const checkNumberString = this.utils._checkIsPhoneNumber(value);
          console.log(checkNumberString);
          if (checkNumberString !== null && checkNumberString != 'INVALID') {
            //right
            that.chatObjects.push({
              type: 'ai',
              message: 'Thank you!',
              date: new Date().getSeconds(),
            });
            this.activateWithdrawSequence();
          } else if (checkNumberString == 'INVALID') {
            that.chatObjects.push({
              type: 'ai',
              message: 'The number is invalid, please try again.',
              date: new Date().getSeconds(),
            });
          } else {
            that.chatObjects.push({
              type: 'ai',
              message: 'Please enter the correct number.',
              date: new Date().getSeconds(),
            });
          }
        } else if (this.TaskSequenceState.withdraw.current == 2) {
          that.chatObjects.push({
            type: 'ai',
            message: 'Your account have been confirmed, Now you can do bank transaction with this session.',
            date: new Date().getSeconds(),
          });
          this.TaskSequenceState.withdraw.current = 0;
          this.toggleMode('normal');
          this.checkIntent('normal');
        }
        this.loading = false;
      } else if (this.chatMode.banking.deposit) {
        if (this.TaskSequenceState.deposit.current == 1) {
          const checkNumberString = this.utils._checkIsPhoneNumber(value);
          console.log(checkNumberString);
          if (checkNumberString !== null && checkNumberString != 'INVALID') {
            //right
            that.chatObjects.push({
              type: 'ai',
              message: 'Thank you!',
              date: new Date().getSeconds(),
            });
            this.activateDepositSequence();
          } else if (checkNumberString == 'INVALID') {
            that.chatObjects.push({
              type: 'ai',
              message: 'The number is invalid, please try again.',
              date: new Date().getSeconds(),
            });
          } else {
            that.chatObjects.push({
              type: 'ai',
              message: 'Please enter the correct number.',
              date: new Date().getSeconds(),
            });
          }
        } else if (this.TaskSequenceState.deposit.current == 2) {
          that.chatObjects.push({
            type: 'ai',
            message: 'Your account have been confirmed, Now you can do bank transaction with this session.',
            date: new Date().getSeconds(),
          });
          this.TaskSequenceState.deposit.current = 0;
          this.toggleMode('normal');
          this.checkIntent('normal');
        }
        this.loading = false;
      } else {
        this._chat.getChatResponse(this._chat.processText(value).toString()).subscribe(
          (data) => {
            setTimeout(async function () {
              console.log(data);
              responseData.intent = data['data']['intent'];
              responseData.response = data['data']['response'];
              const formatResponse = await that.utils._action(responseData.response);
              console.log(formatResponse);
              if (formatResponse.action.type.toUpperCase() == 'LINK') {
                window.open(formatResponse.action.link, '_blank');
              }
              that.chatObjects.push({
                type: 'ai',
                message: formatResponse.response,
                date: new Date().getSeconds(),
              });
              that.loading = false;
              that.checkIntent(responseData.intent);
            }, 1000);
          },
          (err) => {
            this.loading = false;
            console.log(err);
          }
        );
      }

      console.log(this.chatInput);
      if (!this.speech) {
        this.chatInput.nativeElement.value = '';
      }
    }
  }
  currentEmotion = emotionImg.normal;
  changeAIEmotion(emotion: 'normal' | 'happy' | 'sad' | 'angry' | 'shocked') {
    switch (emotion) {
      case 'normal':
        this.currentEmotion = emotionImg.normal;
        break;
      case 'happy':
        this.currentEmotion = emotionImg.happy;
        break;
      case 'sad':
        this.currentEmotion = emotionImg.sad;
        break;
      case 'angry':
        this.currentEmotion = emotionImg.angry;
        break;
      case 'shocked':
        this.currentEmotion = emotionImg.shocked;
        break;
    }
    this.aiAvatar.nativeElement.innerHTML = this.currentEmotion;
  }

  checkIntent(intent) {
    switch (intent) {
      case 'task_add_withdraw':
        this.toggleMode('withdraw');
        break;
      case 'task_add_deposit':
        this.toggleMode('deposit');
        break;
      case 'chat_goodbye':
        this.toggleMode('normal');
        this.changeAIEmotion('sad');
        break;
      case 'chat_greetings':
        this.toggleMode('normal');
        this.changeAIEmotion('happy');
        break;
      case 'normal':
        this.toggleMode('normal');
        this.changeAIEmotion('happy');
        break;
    }
  }

  toggleMode(mode: 'normal' | 'withdraw' | 'deposit' | 'checkBalance') {
    switch (mode) {
      case 'normal':
        this.chatMode = {
          normal: true,
          banking: {
            state: false,
            withdraw: false,
            deposit: false,
            checkBalance: false,
            checkIPO: false,
          },
        };
        break;
      case 'withdraw':
        this.chatMode = {
          normal: false,
          banking: {
            state: true,
            withdraw: true,
            deposit: false,
            checkBalance: false,
            checkIPO: false,
          },
        };
        this.activateWithdrawSequence();
        break;
      case 'deposit':
        this.chatMode = {
          normal: false,
          banking: {
            state: true,
            withdraw: false,
            deposit: true,
            checkBalance: false,
            checkIPO: false,
          },
        };
        this.activateDepositSequence();
        break;
      case 'checkBalance':
        this.chatMode = {
          normal: false,
          banking: {
            state: true,
            withdraw: false,
            deposit: false,
            checkBalance: true,
            checkIPO: false,
          },
        };
        break;
    }
    console.log(this.chatMode);
  }
  TaskSequenceState = {
    withdraw: {
      current: 0,
    },
    deposit: {
      current: 0,
    },
  };

  activateWithdrawSequence() {
    if (this.TaskSequenceState.withdraw.current == 0) {
      this.chatObjects.push({
        type: 'ai',
        message: [
          'Can you give me your mobile banking phone number?',
          'I will be needing your mobile banking user phone number please.',
        ][Math.floor(Math.random() * 1) + 0],
        date: new Date().getSeconds(),
      });
      this.TaskSequenceState.withdraw.current = 1;
    } else if (this.TaskSequenceState.withdraw.current == 1) {
      this.chatObjects.push({
        type: 'ai',
        message: [
          'Please enter the OTP from your phone to confirm your account for this session.',
          'I have sent you an OTP to your phone to confirm your account for this session. ',
        ][Math.floor(Math.random() * 1) + 0],
        date: new Date().getSeconds(),
      });
      this.TaskSequenceState.withdraw.current = 2;
    }
  }

  activateDepositSequence() {
    if (this.TaskSequenceState.deposit.current == 0) {
      this.chatObjects.push({
        type: 'ai',
        message: [
          'Since you are performing a bank transaction, i will need your phone number.',
          'I will be needing your banking user phone number please.',
        ][Math.floor(Math.random() * 1) + 0],
        date: new Date().getSeconds(),
      });
      this.TaskSequenceState.deposit.current = 1;
    } else if (this.TaskSequenceState.deposit.current == 1) {
      this.chatObjects.push({
        type: 'ai',
        message: [
          'Please enter the OTP from your phone to confirm your account for this session.',
          'I have sent you an OTP to your phone to confirm your account for this session. ',
        ][Math.floor(Math.random() * 1) + 0],
        date: new Date().getSeconds(),
      });
      this.TaskSequenceState.deposit.current = 2;
    }
  }
}
