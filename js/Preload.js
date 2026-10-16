/**
 * Created by Asim on 4/20/2017.
 * Changes: no more 5 second wait, loading progress, "TAP TO START" screen
 * (browsers only allow sound after a tap/click), audio errors no longer crash.
 */
function Preload(){

    var _this;
    this._init = function () {

        _this = this;
        this.canvasWrapper = document.getElementsByClassName('wrapper')[0];
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.splashImage = new Image();
        this.splashImage.src = 'images/splash.png';

        this.splashImage.onload = function () {

            _this.ctx.drawImage(_this.splashImage, 0, 0, _this.canvasWrapper.clientWidth, _this.canvasWrapper.clientHeight);
        };

        this.splashAudio = new Audio('audio/splash.aac');
        // the browser may block this until the player taps, that is fine
        try {
            var p = this.splashAudio.play();
            if(p && p.catch)
                p.catch(function () {});
        } catch (err) {}

        this.resources = new Resources();

        this.resources.addImage('character_sprite1_left', 'images/character/character_sprite1_left.png');
        this.resources.addImage('character_sprite1_right', 'images/character/character_sprite1_right.png');

        this.resources.addImage('Enemy-1-left', 'images/character/Enemy-1-left.png');
        this.resources.addImage('Enemy-1-right', 'images/character/Enemy-1-right.png');

        this.resources.addImage('hand_with_gun', 'images/hand_with_gun.png');
        this.resources.addImage('hand_with_gun_left', 'images/hand_with_gun_left.png');
        this.resources.addImage('enemy_gun', 'images/enemy_gun.PNG');
        this.resources.addImage('enemy_gun_left', 'images/enemy_gun_left.PNG');

        this.resources.addAudio('intro', 'audio/intro.mp3');
        this.resources.addAudio('background_music', 'audio/background_music.mp3');
        this.resources.addAudio('gun_shot', 'audio/gun_shot.mp3');

        this.statusBox = document.createElement('div');
        this.statusBox.className = 'loadStatus';
        this.statusBox.innerHTML = 'Loading...';
        this.canvasWrapper.appendChild(this.statusBox);

        this.startTime = new Date().getTime();

        this.preloadInterval = setInterval(function () {

            var total = Object.size(_this.resources.images);
            var loaded = _this.resources.imageLoadedCount;

            if(loaded == total) {
                clearInterval(_this.preloadInterval);
                _this._showStartButton();
            }else{
                var text = 'Loading ' + loaded + ' / ' + total;
                if(new Date().getTime() - _this.startTime > 20000)
                    text += '<br><small>Taking long. A file may be missing or named differently in the images folder.</small>';
                _this.statusBox.innerHTML = text;
            }
        }, 250);
    };

    this._showStartButton = function () {

        var started = false;
        var box = _this.statusBox;

        box.className = 'loadStatus ready';
        box.innerHTML = 'TAP TO START';

        var start = function (e) {

            if(e && e.preventDefault)
                e.preventDefault();
            if(started)
                return;
            started = true;

            if(box.parentNode)
                box.parentNode.removeChild(box);
            _this.splashAudio.pause();
            // created inside the tap, so the browser allows the game sounds
            new Game(_this.canvas, _this.resources);
        };

        box.addEventListener('click', start);
        box.addEventListener('touchend', start);
    };

    this._init();
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

window.onload = function () {

    new Preload();
}
