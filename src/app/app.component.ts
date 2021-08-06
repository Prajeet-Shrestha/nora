import { Component, ViewChild, AfterViewInit } from '@angular/core';
import Speech from './services/speech.js';
import { ChatService } from '../app/services/chat/chat.service';
import { emotionImg } from '../app/services/exports/emotions-img';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('aiChatCloud') aiChatCloud;
  @ViewChild('aiAvatar') aiAvatar;

  title = 'nora';
  cloudDialogBox = 'Hello, I am Nora, Your Banking Assistance. Anyways, I am currently offline.';
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
  constructor(private _chat: ChatService) {}

  ngAfterViewInit() {
    this.ModuleSpeech = new Speech();
    this.toggleChatCloud();
    this.changeAIEmotion('normal');
  }

  toggleChatCloud() {
    let that = this;
    // this.loading = true;
    setTimeout(function () {
      that.aiChatCloud.nativeElement.classList.add('hide-opacity');
      // that.loading = false;
    }, 6000);
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
      this.chatObjects.push({
        type: 'user',
        message: value,
        date: new Date().getSeconds(),
      });
      this.loading = true;
      this._chat.getChatResponse(value.toString()).subscribe(
        (data) => {
          setTimeout(function () {
            console.log(data);
            responseData.intent = data['data']['intent'];
            that.checkIntent(responseData.intent);
            responseData.response = data['data']['response'];
            that.chatObjects.push({
              type: 'ai',
              message: responseData.response,
              date: new Date().getSeconds(),
            });
            that.loading = false;
          }, 1000);
        },
        (err) => {
          this.loading = false;
          console.log(err);
        }
      );
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
      case 'bad':
        this.toggleMode('normal');
        this.changeAIEmotion('angry');
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
  activateWithdrawSequence() {}
}
