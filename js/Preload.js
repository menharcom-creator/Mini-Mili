/**
 * Created by Asim on 4/20/2017.
 * Changes: no more 5 second wait, "LOADING x/y" and a "TOUCH 2 START" prompt drawn
 * over the splash picture (tap anywhere to start - browsers only allow sound after
 * a tap/click), audio errors no longer crash, broken image files are named on screen.
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

        this._createLabels();

        this.startTime = new Date().getTime();

        this.preloadInterval = setInterval(function () {

            var total = Object.size(_this.resources.images);
            var loaded = _this.resources.imageLoadedCount;

            if(loaded == total) {
                clearInterval(_this.preloadInterval);
                _this._showStartPrompt();
            }else{
                _this._setLabels('LOADING', loaded + '/' + total, false);
                if(new Date().getTime() - _this.startTime > 8000)
                    _this._showMissingFiles();
            }
        }, 250);
    };

    // the two words go on the left and right of the big "2" that is part of the splash picture
    this._createLabels = function () {

        var style = 'position:absolute;top:38.3%;transform:translate(-50%,-50%);z-index:5;margin:0;' +
            'font:bold 28px Impact,Haettenschweiler,"Arial Narrow",sans-serif;letter-spacing:2px;' +
            'text-transform:uppercase;white-space:nowrap;pointer-events:none;color:#d3d6d9;' +
            'text-shadow:1px 1px 0 #2b2b33,-1px -1px 0 #2b2b33,1px -1px 0 #2b2b33,-1px 1px 0 #2b2b33,0 2px 4px rgba(0,0,0,0.7);';

        this.leftLabel = document.createElement('div');
        this.leftLabel.className = 'splashLabel';
        this.leftLabel.style.cssText = style + 'left:45.3%;';

        this.rightLabel = document.createElement('div');
        this.rightLabel.className = 'splashLabel';
        this.rightLabel.style.cssText = style + 'left:53.7%;';

        this.noteBox = document.createElement('div');
        this.noteBox.className = 'splashNote';
        this.noteBox.style.cssText = 'position:absolute;left:50%;bottom:90px;transform:translateX(-50%);z-index:5;' +
            'padding:6px 14px;border-radius:6px;background:rgba(0,0,0,0.6);color:#fff;' +
            'font:14px Arial,sans-serif;text-align:center;display:none;pointer-events:none;';

        // small version number: shows which files the phone really loaded
        this.versionTag = document.createElement('div');
        this.versionTag.style.cssText = 'position:absolute;left:8px;bottom:6px;z-index:5;' +
            'font:11px Arial,sans-serif;color:rgba(255,255,255,0.55);pointer-events:none;';
        this.versionTag.innerHTML = 'v4';

        this.canvasWrapper.appendChild(this.leftLabel);
        this.canvasWrapper.appendChild(this.rightLabel);
        this.canvasWrapper.appendChild(this.noteBox);
        this.canvasWrapper.appendChild(this.versionTag);

        this._setLabels('LOADING', '0/' + Object.size(this.resources.images), false);
    };

    this._setLabels = function (left, right, blink) {

        _this.leftLabel.innerHTML = left;
        _this.rightLabel.innerHTML = right;
        _this.leftLabel.className = _this.rightLabel.className = blink ? 'splashLabel blink' : 'splashLabel';
    };

    // an image that finished loading with no size is a broken / missing file
    this._showMissingFiles = function () {

        var missing = [];
        var imgs = _this.resources.images;
        for(var k in imgs){
            if(imgs.hasOwnProperty(k) && imgs[k].complete && imgs[k].naturalWidth === 0)
                missing.push(k);
        }
        if(missing.length){
            _this.noteBox.style.display = 'block';
            _this.noteBox.innerHTML = 'Could not load: ' + missing.join(', ') + '<br>Check the file names in the images folder.';
        }
    };

    this._showStartPrompt = function () {

        var started = false;

        _this.noteBox.style.display = 'none';
        _this._setLabels('TOUCH', 'START', true);

        var start = function (e) {

            if(e && e.preventDefault)
                e.preventDefault();
            if(started)
                return;
            started = true;

            document.removeEventListener('click', start);
            document.removeEventListener('touchend', start);

            _this.canvasWrapper.removeChild(_this.leftLabel);
            _this.canvasWrapper.removeChild(_this.rightLabel);
            _this.canvasWrapper.removeChild(_this.noteBox);
            _this.canvasWrapper.removeChild(_this.versionTag);
            _this.splashAudio.pause();
            // created inside the tap, so the browser allows the game sounds
            new Game(_this.canvas, _this.resources);
        };

        // tap anywhere on the screen
        document.addEventListener('click', start);
        document.addEventListener('touchend', start);
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
