import { Component, ViewChild, AfterViewInit } from '@angular/core';
import Speech from './services/speech.js';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'nora';
  chatObjects = [
    {
      type: 'ai',
      message:
        'Hi, I am offline at the moment. So sorry for in the trouble. Please wait for me, i will be right back with you in few days.',
      date: 0,
    },
  ];
  loading: boolean = false;
  nora = {
    level: 1,
    xp: 10,
    mood: 'Sad',
  };
  ModuleSpeech;
  constructor() {}

  ngAfterViewInit() {
    this.ModuleSpeech = new Speech();
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
    if (value.length >= 1) {
      this.chatObjects.push({
        type: 'user',
        message: value,
        date: new Date().getSeconds(),
      });
      console.log(this.chatInput);
      if (!this.speech) {
        this.chatInput.nativeElement.value = '';
      }
    }
  }
}
