import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'nora';
  chatObjects = [
    {
      type: 'ai',
      message:
        'Hi, I am offline at the moment. So sorry for in the trouble. Please wait for me, i will be right back with you in few days.',
      date: 0,
    },
  ];

  nora = {
    level: 1,
    xp: 10,
    mood: 'Sad',
  };
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
      this.chatInput.nativeElement.value = '';
    }
  }
}
