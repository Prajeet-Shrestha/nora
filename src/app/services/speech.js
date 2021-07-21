class Speech {
  start() {
    if (annyang) {
      var commands = {
        'hey nora *val': function (val) {
          var ele = document.getElementById('chatInput');
          var currentText = ele.value;
          ele.setAttribute('value', currentText + ' ' + val);
          console.log();
        },
        'hi nora *val': function (val) {
          var ele = document.getElementById('chatInput');
          var currentText = ele.value;
          ele.setAttribute('value', currentText + ' ' + val);
          console.log();
        },
        'nora *val': function (val) {
          var ele = document.getElementById('chatInput');
          var currentText = ele.value;
          ele.setAttribute('value', currentText + ' ' + val);
          console.log();
        },
        'continue message *val': function (val) {
          var ele = document.getElementById('chatInput');
          var currentText = ele.value;
          ele.setAttribute('value', currentText + ' ' + val);
        },
        'clear message': function () {
          var ele = document.getElementById('chatInput');
          console.log(ele);
          ele.setAttribute('value', '');
        },
        'send message': function () {
          var button = document.getElementById('SendEnterKey');
          button.click();
          var ele = document.getElementById('chatInput');
          console.log(ele);
          ele.setAttribute('value', '');
        },
      };
      annyang.addCommands(commands);
      annyang.debug();
      annyang.start();
    }
  }
  stop() {
    if (annyang) {
      annyang.debug();
      annyang.abort();
    }
  }
  constructor() {}
}

export default Speech;
