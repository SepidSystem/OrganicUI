var ProgressBar = require('progress');
 
var Menu = require('terminal-menu');
var menu = Menu({ width: 49, x: 4, y: 2 });
menu.reset();
menu.write('SERIOUS DEVELOPER TERMINAL\n');
menu.write('------------------------------------------------\n');
menu.add('START SERVER');
menu.add('START DEV SERVER');
menu.add('VERIFY CODE');
menu.add('AUTO BUILD');
menu.add('RUN HEADLESS TEST');
menu.add('EXTRACT i18n TEXTS');
menu.add('SAFE COMMIT');
menu.add('ACTIVATE TASKS');
    
menu.add('DEPLOY');
menu.add('EXIT');
 
menu.on('select', function (label) {
     menu.close();
     console.log();
    console.log('SELECTED: ' + label);
    var bar = new ProgressBar('[:bar] :percent', { total: 50 });
var timer = setInterval(function(){
bar.tick();
  if (bar.complete) {
    console.log('\ncomplete\n');
    clearInterval(timer);
  }
}, 100);
});
process.stdin.pipe(menu.createStream()).pipe(process.stdout);
 
process.stdin.setRawMode(true);
menu.on('close', function () {
    process.stdin.setRawMode(false);
    process.stdin.end();
});