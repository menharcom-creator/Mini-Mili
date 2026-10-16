/**
 * Touch controls for phones and tablets.
 *
 *  - Left side of the screen: put your thumb down and drag.
 *      left / right  = move (A / D)
 *      up            = jetpack (W)
 *  - Everywhere else: touch (and hold) to aim at that spot and shoot.
 *
 * It reuses the keyboard / mouse handlers of Game, so nothing else changes.
 */
function TouchControls(game) {

    var _this = this;

    this._init = function () {

        this.game = game;
        this.moveId = null;
        this.aimId = null;
        this.originX = 0;
        this.originY = 0;
        this.lastAim = {clientX: 0, clientY: 0};
        this.fireTimer = null;
        this.keys = {65: false, 68: false, 87: false};
        this.deadZoneX = 18;
        this.deadZoneY = 22;
        this.maxKnob = 45;

        this.root = document.createElement('div');
        this.root.id = 'touchControls';

        this.joyBase = document.createElement('div');
        this.joyBase.className = 'joyBase';
        this.joyKnob = document.createElement('div');
        this.joyKnob.className = 'joyKnob';
        this.joyBase.appendChild(this.joyKnob);
        this.root.appendChild(this.joyBase);

        this.hint = document.createElement('div');
        this.hint.className = 'touchHint';
        this.hint.innerHTML = '&#9664; drag to move / fly &#9654; &nbsp;&nbsp;|&nbsp;&nbsp; touch to aim &amp; shoot';
        this.root.appendChild(this.hint);

        document.body.appendChild(this.root);

        this.onStart = function (e) { _this._handleStart(e); };
        this.onMove = function (e) { _this._handleMove(e); };
        this.onEnd = function (e) { _this._handleEnd(e); };

        this.root.addEventListener('touchstart', this.onStart, {passive: false});
        this.root.addEventListener('touchmove', this.onMove, {passive: false});
        this.root.addEventListener('touchend', this.onEnd, {passive: false});
        this.root.addEventListener('touchcancel', this.onEnd, {passive: false});

        setTimeout(function () {
            if(_this.hint)
                _this.hint.style.opacity = 0;
        }, 6000);
    };

    this._handleStart = function (e) {

        e.preventDefault();
        for(var i = 0; i < e.changedTouches.length; i++){

            var t = e.changedTouches[i];
            if(t.clientX < window.innerWidth * 0.35 && _this.moveId === null){

                _this.moveId = t.identifier;
                _this.originX = t.clientX;
                _this.originY = t.clientY;
                _this.joyBase.style.left = (t.clientX - 60) + 'px';
                _this.joyBase.style.top = (t.clientY - 60) + 'px';
                _this.joyBase.style.display = 'block';
                _this._updateMove(t);
            }else if(_this.aimId === null){

                _this.aimId = t.identifier;
                _this._aim(t);
                _this._fire();
                _this.fireTimer = setInterval(function () {
                    _this._fire();
                }, 220);
            }
        }
    };

    this._handleMove = function (e) {

        e.preventDefault();
        for(var i = 0; i < e.changedTouches.length; i++){

            var t = e.changedTouches[i];
            if(t.identifier === _this.moveId)
                _this._updateMove(t);
            else if(t.identifier === _this.aimId)
                _this._aim(t);
        }
    };

    this._handleEnd = function (e) {

        e.preventDefault();
        for(var i = 0; i < e.changedTouches.length; i++){

            var id = e.changedTouches[i].identifier;
            if(id === _this.moveId){

                _this.moveId = null;
                _this._releaseMove();
            }else if(id === _this.aimId){

                _this.aimId = null;
                _this._stopFire();
            }
        }
    };

    this._updateMove = function (t) {

        var dx = t.clientX - _this.originX;
        var dy = t.clientY - _this.originY;

        _this._setKey(65, dx < -_this.deadZoneX);
        _this._setKey(68, dx > _this.deadZoneX);
        _this._setKey(87, dy < -_this.deadZoneY);

        var dist = Math.sqrt(dx * dx + dy * dy);
        if(dist > _this.maxKnob){
            dx = dx / dist * _this.maxKnob;
            dy = dy / dist * _this.maxKnob;
        }
        _this.joyKnob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    };

    this._releaseMove = function () {

        _this._setKey(65, false);
        _this._setKey(68, false);
        _this._setKey(87, false);
        _this.joyKnob.style.transform = 'translate(0px,0px)';
        _this.joyBase.style.display = 'none';
    };

    this._setKey = function (code, on) {

        if(_this.keys[code] === on)
            return;
        _this.keys[code] = on;
        if(on)
            _this.game.addMovements({which: code});
        else
            _this.game.removeMovements({which: code});
    };

    this._aim = function (t) {

        _this.lastAim = {clientX: t.clientX, clientY: t.clientY};
        _this.game.updateFaceSideEvent(_this.lastAim);
    };

    this._fire = function () {

        _this.game.fireBulletEvent(_this.lastAim);
    };

    this._stopFire = function () {

        if(_this.fireTimer !== null){
            clearInterval(_this.fireTimer);
            _this.fireTimer = null;
        }
    };

    this.destroy = function () {

        _this._stopFire();
        _this._releaseMove();
        if(_this.root && _this.root.parentNode)
            _this.root.parentNode.removeChild(_this.root);
        _this.root = null;
    };

    this._init();
}

TouchControls.isSupported = function () {

    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
};
