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
  conversationHelper_state = {
    normalChat: true,
    bankChat: false,
    dashboard: true,
  };
  conversationHelper = {
    bankChat: [
      {
        message: 'Please, Can you check my bank balance?',
      },
    ],
    normalChat: [
      {
        message: 'Hey Nora',
      },
      {
        message: 'Who are you?',
      },
      {
        message: 'What do you do?',
      },
      {
        message: 'I want to transfer money to someone.',
      },
      {
        message: 'I want to transfer money to someone.',
      },
      {
        message: 'I want to transfer money to someone.',
      },
      {
        message: 'I want to transfer money to someone.',
      },
    ],
  };

  title = 'nora';
  cloudDialogBox = "I hope you're taking good care of yourself!";
  chatObjects = [
    {
      type: 'ai',
      message: 'Hello, I am Nora, Your Banking Assistance.',
      date: 0,
      rate: 0,
    },
  ];
  chatMode = {
    normal: true,
    banking: {
      state: false,
      withdraw: false,
      transfer: false,

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

    this._level.___init___();
    this._level.publicCurrentAI.subscribe((data) => {
      this.nora.level = data['level'];

      this.nora.xp = data['xp'];
      this.nora.mood = data['emotion'];
      if (this.nora.level < data['level']) {
        this.showCloudText('yayy, I am leveling up!');
      }
    });
    if (this.utils.IsAuthenticated()) {
      const user = this.utils.getLocalStorage('user');
      this.showCloudText(`Welcome back, ${user.firstName}`);
      this.showCloudText(
        [
          `Welcome back, ${user.firstName}`,
          `It is always good to see you ${user.firstName}`,
          `Hope you are having a good day, ${user.firstName}`,
        ][Math.floor(Math.random() * 3)]
      );
    } else {
      this.showCloudText(
        [
          'Hello, I am Nora',
          'I am Nora, I hope you are taking good care of yourself.',
          'Hey there, I am Nora, How can i be of service?',
        ][Math.floor(Math.random() * 1) + 3]
      );
    }
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
        date: new Date().getTime() / 1000,
        rate: 0,
      });
      // prevBox.scrollTop = prevBox.scrollHeight;

      if (this.chatMode.banking.withdraw) {
        console.log('is authenticated', this.utils.IsAuthenticated());
        if (!this.utils.IsAuthenticated()) {
          this.loading = true;
          that.AuthForTransaction(value, this.TaskSequenceState.withdraw.current, 'withdraw');
        } else {
          this.withdrawSequence(value);
        }
      } else if (this.chatMode.banking.deposit) {
        console.log('is authenticated', this.utils.IsAuthenticated());
        if (!this.utils.IsAuthenticated()) {
          this.loading = true;
          that.AuthForTransaction(value, this.TaskSequenceState.deposit.current, 'deposit');
        } else {
          this.depositSequence(value);
        }
      } else if (this.chatMode.banking.transfer) {
        console.log('is authenticated', this.utils.IsAuthenticated());
        console.log('Chat Mode Transfer');

        if (!this.utils.IsAuthenticated()) {
          this.loading = true;
          that.AuthForTransaction(value, this.TaskSequenceState.transfer.current, 'transfer');
        } else {
          this.transferSequence(value);
        }
      } else {
        this.loading = true;
        this._chat.getChatResponse(this._chat.processText(value).toString()).subscribe(
          (data) => {
            setTimeout(async function () {
              console.log(data);
              responseData.intent = data['data']['intent'];
              console.log(that.emotionCompiler(responseData.intent));
              responseData.response = data['data']['response'];
              const formatResponse = await that.utils._action(responseData.response);
              console.log(formatResponse);
              if (formatResponse.action.type.toUpperCase() == 'LINK') {
                window.open(formatResponse.action.link, '_blank');
              }

              that.chatObjects.push({
                type: 'ai',
                message: formatResponse.response,
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              let prevBox = document.getElementById('chatPreviewBox');
              var xH = prevBox.scrollHeight;
              prevBox.scrollTop = prevBox.scrollHeight;
              console.log('ScrollTop:', prevBox.scrollTop);
              console.log('ClientHeight:', prevBox.clientHeight);
              console.log('ScrollHeight:', prevBox.scrollHeight);
              that.loading = false;
              that.checkIntent(responseData.intent, value);
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

  checkIntent(intent, value = '') {
    switch (intent) {
      case 'task_addWithdraw_normal':
        this.toggleMode('withdraw', value);
        break;
      case 'task_addDeposit_normal':
        this.toggleMode('deposit', value);
        break;
      case 'task_transferMoney_normal':
        this.toggleMode('transfer', value);
        break;
      case 'chat_goodbye_sad':
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
      case 'task_checkBalance_normal':
        this.toggleMode('checkBalance');
        this.changeAIEmotion('happy');
        break;
    }
  }

  toggleMode(mode: 'transfer' | 'normal' | 'withdraw' | 'deposit' | 'checkBalance', value = '') {
    switch (mode) {
      case 'normal':
        this.chatMode = {
          normal: true,
          banking: {
            state: false,
            transfer: false,
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
            transfer: false,
            withdraw: true,
            deposit: false,
            checkBalance: false,
            checkIPO: false,
          },
        };
        let hadWithdrawMoney = this.utils.findMoneyInText(value);
        hadWithdrawMoney != 0 ? (this.TaskSequenceState.withdraw.amount = hadWithdrawMoney) : null;
        hadWithdrawMoney != 0 ? (this.TaskSequenceState.withdraw.task = 1) : null;

        this.utils.IsAuthenticated() ? this.activateWithdrawSequence() : this.activateAuthSequence('withdraw');
        break;
      case 'transfer':
        this.chatMode = {
          normal: false,
          banking: {
            transfer: true,
            state: true,
            withdraw: false,
            deposit: false,
            checkBalance: false,
            checkIPO: false,
          },
        };

        this.utils.IsAuthenticated() ? this.activateTransferSequence() : this.activateAuthSequence('transfer');
        break;
      case 'deposit':
        this.chatMode = {
          normal: false,
          banking: {
            state: true,
            transfer: false,
            withdraw: false,
            deposit: true,
            checkBalance: false,
            checkIPO: false,
          },
        };
        let hadMoney = this.utils.findMoneyInText(value);
        hadMoney != 0 ? (this.TaskSequenceState.deposit.amount = hadMoney) : null;
        hadMoney != 0 ? (this.TaskSequenceState.deposit.task = 1) : null;
        this.utils.IsAuthenticated() ? this.activateDepositSequence() : this.activateAuthSequence('deposit');
        break;
      case 'checkBalance':
        this.chatMode = {
          normal: false,
          banking: {
            transfer: false,
            state: true,
            withdraw: false,
            deposit: false,
            checkBalance: true,
            checkIPO: false,
          },
        };
        this.checkbalance();
        break;
    }
    console.log(this.chatMode);
  }
  TaskSequenceState = {
    withdraw: {
      amount: 0,
      current: 0,
      task: 0,
    },
    deposit: {
      amount: 0,
      task: 0,
      current: 0,
    },
    transfer: {
      toPhoneNumber: 0,
      amount: 0,
      task: 0,
      current: 0,
    },
  };

  activateTransferSequence() {
    if (this.TaskSequenceState.transfer.task == 0) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: [
          'How much do you want to transfer?',
          'What is the amount that you wanted to transfer?',
          'What amount do you have in your mind?',
        ][Math.floor(Math.random() * 1) + 2],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.transfer.task = 1;
    } else if (this.TaskSequenceState.transfer.task == 1) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: ['Please enter the recipient phone number.'][Math.floor(Math.random() * 1) + 0],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.transfer.task = 2;
    } else if (this.TaskSequenceState.transfer.task == 2) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: ['Please enter the pin code.'][Math.floor(Math.random() * 1) + 0],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.transfer.task = 3;
    }
  }

  transferSequence(value) {
    let that = this;
    console.log(this.TaskSequenceState.transfer);
    if (this.TaskSequenceState.transfer.task == 1) {
      const checkNumberString = this.utils.findMoneyInText(value);
      console.log(checkNumberString);
      if (checkNumberString != 0) {
        //right
        this.TaskSequenceState.deposit.amount = checkNumberString;
        that.chatObjects.push({
          type: 'ai',
          message: 'Rs. ' + checkNumberString + ' will be withdrawn from your account.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
        this.TaskSequenceState.transfer.amount = checkNumberString;
        this.activateTransferSequence();
      } else {
        that.chatObjects.push({
          type: 'ai',
          message: 'Please enter the correct number.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
      }
    } else if (this.TaskSequenceState.transfer.task == 2) {
      console.log('step 2');
      const checkNumberString = this.utils.findMoneyInText(value);
      console.log(checkNumberString);
      const isPhoneNumber = this.utils._checkIsPhoneNumber(value);
      console.log(isPhoneNumber);
      if (isPhoneNumber !== null && isPhoneNumber != 'INVALID') {
        //right
        this.TaskSequenceState.transfer.toPhoneNumber = checkNumberString;
        that.chatObjects.push({
          type: 'ai',
          message: `Are you sure you want to transfer Rs. ${this.TaskSequenceState.transfer.amount} to recipient number ${checkNumberString}?`,
          date: new Date().getTime() / 1000,
          rate: 0,
        });
        this.activateTransferSequence();
      } else {
        that.chatObjects.push({
          type: 'ai',
          message: 'Please enter the correct number.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
      }
    } else if (this.TaskSequenceState.transfer.task == 3) {
      const checkPin = this.utils.findPinCodeInText(value);
      console.log('ping', checkPin);
      if (checkPin != 0) {
        this._chat
          .chatTaskTransfer(
            this.utils.getLocalStorage('user').phone,
            this.TaskSequenceState.transfer.amount,
            this.TaskSequenceState.transfer.toPhoneNumber,
            checkPin
          )
          .subscribe(
            (data) => {
              console.log(data);
              that.chatObjects.push({
                type: 'ai',
                message: `Rs. ${this.TaskSequenceState.transfer.amount} has been transferred to recipient no. ${this.TaskSequenceState.transfer.toPhoneNumber}. Thank for using the service.`,
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              this.TaskSequenceState.transfer.task = 0;
              this.toggleMode('normal');
              this.checkIntent('normal');
            },
            (err) => {
              that.chatObjects.push({
                type: 'ai',
                message: 'The pin is invalid, please try again',
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              console.log(err);
            }
          );
      }
    }
  }

  activateWithdrawSequence() {
    if (this.TaskSequenceState.withdraw.task == 0) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: [
          'How much would you want to withdraw from your bank?',
          'How much should i take out from bank?',
          'Thank you for using the service, how much should i withdraw?',
        ][Math.floor(Math.random() * 1) + 2],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.withdraw.task = 1;
    } else if (this.TaskSequenceState.withdraw.task == 1) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: ['Please enter the pin code.'][Math.floor(Math.random() * 1) + 0],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.withdraw.task = 2;
    }
  }

  activateDepositSequence() {
    if (this.TaskSequenceState.deposit.task == 0) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: [
          'Please hand the cash to the slot. ',
          'Can you please put the cash on the slot below.',
          'I will be able to count the cash once you insert it in the slot.',
        ][Math.floor(Math.random() * 1) + 2],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.deposit.task = 1;
    } else if (this.TaskSequenceState.deposit.task == 1) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: ['Please enter the pin code.'][Math.floor(Math.random() * 1) + 0],
        date: new Date().getTime() / 1000,
      });
      this.TaskSequenceState.deposit.task = 2;
    }
  }

  depositSequence(value) {
    let that = this;
    if (this.TaskSequenceState.deposit.task == 1) {
      const checkNumberString = this.utils.findMoneyInText(value);
      console.log(checkNumberString);
      if (checkNumberString != 0) {
        //right
        this.TaskSequenceState.deposit.amount = checkNumberString;
        that.chatObjects.push({
          type: 'ai',
          message: 'Rs. ' + checkNumberString + ' will be deposited on your account.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
        this.activateDepositSequence();
      } else {
        that.chatObjects.push({
          type: 'ai',
          message: 'Please enter the correct number.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
      }
    } else if (this.TaskSequenceState.deposit.task == 2) {
      const checkPin = this.utils.findPinCodeInText(value);
      if (checkPin != 0) {
        this._chat
          .chatTaskDeposit(
            this.utils.getLocalStorage('user').phone,
            this.TaskSequenceState.deposit.amount,
            '',
            checkPin
          )
          .subscribe(
            (data) => {
              console.log(data);
              that.chatObjects.push({
                type: 'ai',
                message: 'Money Deposited. Thank you.',
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              this.TaskSequenceState.deposit.task = 0;
              this.toggleMode('normal');
              this.checkIntent('normal');
            },
            (err) => {
              that.chatObjects.push({
                type: 'ai',
                message: 'The pin is invalid, please try again',
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              console.log(err);
            }
          );
      }
    }
  }

  withdrawSequence(value) {
    let that = this;
    if (this.TaskSequenceState.withdraw.task == 1) {
      const checkNumberString = this.utils.findMoneyInText(value);
      console.log(checkNumberString);
      if (checkNumberString != 0) {
        //right
        this.TaskSequenceState.withdraw.amount = checkNumberString;
        that.chatObjects.push({
          type: 'ai',
          message: 'Rs. ' + checkNumberString + ' will be deducted form your account.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
        this.activateWithdrawSequence();
      } else {
        that.chatObjects.push({
          type: 'ai',
          message: 'Please enter the correct number.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
      }
    } else if (this.TaskSequenceState.withdraw.task == 2) {
      const checkPin = this.utils.findPinCodeInText(value);
      if (checkPin != 0) {
        this._chat
          .chatTaskWithdraw(
            this.utils.getLocalStorage('user').phone,
            this.TaskSequenceState.withdraw.amount,
            '',
            checkPin
          )
          .subscribe(
            (data) => {
              console.log(data);
              that.chatObjects.push({
                type: 'ai',
                message: 'Money Withdrawn',
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              this.TaskSequenceState.withdraw.task = 0;
              this.toggleMode('normal');
              this.checkIntent('normal');
            },
            (err) => {
              that.chatObjects.push({
                type: 'ai',
                message: 'The pin is invalid, please try again',
                date: new Date().getTime() / 1000,
                rate: 0,
              });
              console.log(err);
            }
          );
      }
    }
  }

  activateAuthSequence(type: 'withdraw' | 'deposit' | 'transfer') {
    let condition_1;
    let condition_2;
    if (type == 'withdraw') {
      console.log('withdrawn c1');
      condition_1 = this.TaskSequenceState.withdraw.current == 0;
    } else if (type == 'deposit') {
      console.log(this.TaskSequenceState.deposit);

      condition_1 = this.TaskSequenceState.deposit.current == 0;
    } else if (type == 'transfer') {
      console.log('transfer c1');

      condition_1 = this.TaskSequenceState.transfer.current == 0;
    }
    console.log('condition_1', condition_1);
    if (type == 'withdraw') {
      console.log('withdrawn c2');

      condition_2 = this.TaskSequenceState.withdraw.current == 1;
    } else if (type == 'deposit') {
      console.log('c2');
      console.log(this.TaskSequenceState.deposit);

      condition_2 = this.TaskSequenceState.deposit.current == 1;
    } else if (type == 'transfer') {
      console.log('transfer c2');

      condition_2 = this.TaskSequenceState.transfer.current == 1;
    }
    console.log('condition_2', condition_2);

    if (condition_1) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: [
          'Can you give me your mobile banking phone number?',
          'I will be needing your mobile banking user phone number please.',
          'Since you are performing a bank transaction, i will need your phone number.',
          'I will be needing your banking user phone number please.',
        ][Math.floor(Math.random() * 1) + 0],
        date: new Date().getTime() / 1000,
      });
      // type == 'withdraw' ? (this.TaskSequenceState.withdraw.current = 1) : (this.TaskSequenceState.deposit.current = 1);
      if (type == 'withdraw') {
        this.TaskSequenceState.withdraw.current = 1;
      } else if (type == 'deposit') {
        this.TaskSequenceState.deposit.current = 1;
        console.log(this.TaskSequenceState.deposit);
      } else if (type == 'transfer') {
        this.TaskSequenceState.transfer.current = 1;
      }
    } else if (condition_2) {
      this.chatObjects.push({
        type: 'ai',
        rate: 0,
        message: [
          'Please enter the OTP from your phone to confirm your account for this session.',

          'I have sent you an OTP to your phone to confirm your account for this session. ',
        ][Math.floor(Math.random() * 1) + 0],
        date: new Date().getTime() / 1000,
      });
      // type == 'withdraw' ? (this.TaskSequenceState.withdraw.current = 2) : (this.TaskSequenceState.deposit.current = 2);
      if (type == 'withdraw') {
        this.TaskSequenceState.withdraw.current = 2;
      } else if (type == 'deposit') {
        this.TaskSequenceState.deposit.current = 2;
      } else if (type == 'transfer') {
        this.TaskSequenceState.transfer.current = 2;
      }
    }
  }

  user = {
    phoneNumber: '',
    otp: '',
  };

  AuthForTransaction(value, TaskSequenceState, type: 'withdraw' | 'deposit' | 'transfer') {
    let that = this;
    console.log('auth transaction');
    if (TaskSequenceState == 1) {
      const checkNumberString = this.utils._checkIsPhoneNumber(value);
      console.log(checkNumberString);
      if (checkNumberString !== null && checkNumberString != 'INVALID') {
        //right
        that.user.phoneNumber = checkNumberString;
        that.chatObjects.push({
          type: 'ai',
          message: 'Thank you!',
          date: new Date().getTime() / 1000,
          rate: 0,
        });

        // type == 'withdraw' ? this.activateAuthSequence('withdraw') : this.activateAuthSequence('deposit');
        if (type == 'withdraw') {
          this.activateAuthSequence('withdraw');
        } else if (type == 'deposit') {
          this.activateAuthSequence('deposit');
        } else if (type == 'transfer') {
          this.activateAuthSequence('transfer');
        }
      } else if (checkNumberString == 'INVALID') {
        that.chatObjects.push({
          type: 'ai',
          message: 'The number is invalid, please try again.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
      } else {
        that.chatObjects.push({
          type: 'ai',
          message: 'Please enter the correct number.',
          date: new Date().getTime() / 1000,
          rate: 0,
        });
      }
    } else if (TaskSequenceState == 2) {
      this.user.otp = value;
      this._chat.chatTaskAuth(this.user.otp, this.user.phoneNumber).subscribe(
        (data) => {
          console.log(data);
          that.chatObjects.push({
            type: 'ai',
            message: 'Your account have been confirmed, Now you can do bank transaction with this session.',
            date: new Date().getTime() / 1000,
            rate: 0,
          });
          that.chatObjects.push({
            type: 'ai',
            message: `Welcome, ${data.data.user.firstName} .`,
            date: new Date().getTime() / 1000,
            rate: 0,
          });
          this.utils.setUserInLocalStorage(this.user.phoneNumber, this.user.otp, data.data.user);

          // type == 'withdraw'
          //   ? (this.TaskSequenceState.withdraw.current = 0)
          //   : (this.TaskSequenceState.deposit.current = 0);
          if (type == 'withdraw') {
            this.TaskSequenceState.withdraw.current = 0;
            this.toggleMode('withdraw', '');
          } else if (type == 'deposit') {
            this.TaskSequenceState.deposit.current = 0;
            this.toggleMode('deposit', '');
          } else if (type == 'transfer') {
            this.TaskSequenceState.transfer.current = 0;
            this.toggleMode('transfer', '');
          }
        },
        (err) => {
          console.log(err);
          that.chatObjects.push({
            type: 'ai',
            message: "I am sorry but i couldn't find you in my database,please try again later.",
            date: new Date().getTime() / 1000,
            rate: 0,
          });
          // type == 'withdraw'
          //   ? (this.TaskSequenceState.withdraw.current = 0)
          //   : (this.TaskSequenceState.deposit.current = 0);
          if (type == 'withdraw') {
            this.TaskSequenceState.withdraw.current = 0;
          } else if (type == 'deposit') {
            this.TaskSequenceState.deposit.current = 0;
          } else if (type == 'transfer') {
            this.TaskSequenceState.transfer.current = 0;
          }
          this.toggleMode('normal');
          this.checkIntent('normal');
        }
      );
    }
    this.loading = false;
  }

  rateDown(index) {
    if (this.chatObjects[index].rate > -6) {
      this.chatObjects[index].rate -= 1;
    }
    console.log(this.chatObjects[index]);
  }

  rateUp(index) {
    if (this.chatObjects[index].rate < 6) {
      this.chatObjects[index].rate += 1;
    }
  }

  checkbalance() {
    const user = this.utils.getLocalStorage('user');
    this.loading = true;
    if (user) {
      this._chat.chatTaskCheckBalance(user.phone).subscribe(
        (data) => {
          console.log(data);
          this.chatObjects.push({
            type: 'ai',
            message: 'You have Rs.' + data.data.balance + ' in your account.',
            date: new Date().getTime() / 1000,
            rate: 0,
          });
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.changeAIEmotion('sad');
          this.chatObjects.push({
            type: 'ai',
            message: 'Something went wrong, i am not sure what please refresh again.',
            date: new Date().getTime() / 1000,
            rate: 0,
          });
          console.log(err);
        }
      );
    } else {
      this.loading = false;

      this.chatObjects.push({
        type: 'ai',
        message: 'Please login to the session so i can get access to your account.',
        date: new Date().getTime() / 1000,
        rate: 0,
      });
    }
  }

  emotionCompiler(tag: string) {
    let objects = tag.split('_');
    switch (objects[2]) {
      case 'happy':
        this.changeAIEmotion('happy');
        break;
      case 'sad':
        this.changeAIEmotion('sad');
        break;
      case 'angry':
        this.changeAIEmotion('angry');
        break;
      case 'shocked':
        this.changeAIEmotion('shocked');
        break;
      default:
        this.changeAIEmotion('normal');
        break;
    }
  }

  toggleChatHelper() {
    if (this.conversationHelper_state.bankChat) {
      this.conversationHelper_state.bankChat = false;
      this.conversationHelper_state.normalChat = true;
    } else if (this.conversationHelper_state.normalChat) {
      this.conversationHelper_state.bankChat = true;
      this.conversationHelper_state.normalChat = false;
    }
  }

  sendUpFromHelper(value) {
    this.addUserMessage(value);
  }
}
