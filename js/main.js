(function(){

  let readOut;
  let playBtn;
  let connectPuck;
  const sounds = [];
  const imgs = ['seinfeld_logo.png', 'cheers_logo.png', 'the_who_logo.png'];
  const path = 'audio/';

  sounds.push( new Howl({ src:[ path + 'seinfeld.mp3'] }) );
  sounds.push( new Howl({ src:[ path + 'cheers.mp3'] }) );
  sounds.push( new Howl({ src:[ path + 'yeah.mp3'] }) );


  let currentIndex = 0;
  let isOpen = false;
  let isPlaying = false;
  let zero = null;

  function init() {

    readOut = document.getElementById('readOut');
    playBtn = document.getElementById('playBtn');
    connectPuck = document.getElementById('connectPuck');

    connectPuck.addEventListener('click', function(){
      initConnection();
    });

    playBtn.addEventListener('click', function(){
      playSound();
    });

    showImage();
  };

  function onLine(v) {
    console.log("v ",  v, typeof v);
    var obj = null;
    try{
      obj = JSON.parse( v );
      // console.log( obj );
    }catch(error){
      console.log(error);
    }


    if( obj ){
      zero = zero || {x:parseInt(obj.magX), y:parseInt(obj.magY), z:parseInt(obj.magZ)};

      readMagnetometer(obj.magX, obj.magY, obj.magZ);
    }
  };

  function readMagnetometer(x, y, z){

    // x = Math.abs(x) - Math.abs(zero.x);
    // y = Math.abs(y) - Math.abs(zero.y);
    // z = Math.abs(z) - Math.abs(zero.z);

    var strength = Math.sqrt( x*x + y*y + z*z);

    console.log('readMagnetometer! ', x, y, z, strength, zero);

    var open = strength < 1000;
    if(open != isOpen){
      isOpen = open;
      playSound();
    }
  };

  function initConnection(){
    console.log('initConnection');
    Puck.connect(function(c) {
      if (!c) {
        alert("Couldn't connect!");
        readOut.innerHTML = 'Puck Connection failed!';
        return;
      }
      connection = c;
      var buf = "";
      readOut.innerHTML = 'Puck Connected!';
      connectPuck.classList.add('connected');

      connection.on("data", function(d) {
        buf += d;
        var i = buf.indexOf("\n");
        while (i>=0) {
          onLine(buf.substr(0,i));
          buf = buf.substr(i+1);
          i = buf.indexOf("\n");
        }
      });

      setTimeout(function() {

        console.log("set time out called")

        // get all data is a method on the puck itself
        connection.write("setInterval(function(){ Bluetooth.println( getAllData());},500);\n",
        // connection.write("setInterval(function(){Bluetooth.println(Puck.mag(); \n);},10);\n",
          function() { console.log("Ready..."); });
      }, 1500);
    });
  };

  function onSoundComplete(){
    console.log('onSoundComplete ', currentIndex);
    currentIndex++;
    showImage();
  };

  function playSound(){

    if( isPlaying ) return;
    let s = sounds[ currentIndex % sounds.length ];
    s.play();
    isPlaying = true;

    s.on('end', function(){
      console.log(' Finished!');
      onSoundComplete();
      isPlaying = false;
    });
  };

  function showImage(){
    var newImg = 'images/' + imgs[ currentIndex % imgs.length ];
    console.log('showImage ', newImg, readOut);
    playBtn.style.backgroundImage = 'url('+newImg+')';
  };

  window.onload = init;
})();
