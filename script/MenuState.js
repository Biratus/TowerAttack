function MenuState() {
    Phaser.State.call(this);
}

MenuState.prototype = Object.create(Phaser.State.prototype);
MenuState.prototype.constructor = MenuState;

MenuState.prototype.create=function() {
    var bg = game.add.image(0, 0, 'bg_menu');
    bg.width=game.world.width;
    bg.height=game.world.height;

    var g=game.add.group();
    g.inputEnableChildren=true;
    g.classType=Phaser.Image;
    g.createMultiple(1,['b_level1','b_level2','b_level3','b_credits'],0,true);
    g.onChildInputUp.add(this.startLevel,this);
    g.align(1,4,game.world.width*0.75,game.world.height*0.1);
    g.alignIn(game.world.bounds,Phaser.CENTER);

    this.music = game.add.audio('title');
    this.music.loop = true;
    this.music.play();
}
MenuState.prototype.startLevel= function(button) {
    var lvl=0;
    var key=button.key.charAt(button.key.length-1);
    try {
        lvl=parseInt(key)-1;
    }catch(e) {console.error(e);}
    if(isNaN(lvl)) this.credits();
    else {
        this.music.stop();
        game.camera.fade(0x000000,700);
        game.camera.onFadeComplete.addOnce(function(lvl){
            console.log('complete');
            game.camera.resetFX();
            game.state.clearCurrentState();
            game.state.start('LevelState', true, false, lvl);
        },game,null,lvl);
    }
}

MenuState.prototype.credits = function() {
    var creds = game.add.image(0, 0, 'bg_credits');
    creds.inputEnabled=true;
    var ratio_h = game.world.height/creds.height;
    var ratio_w = game.world.width/creds.width;
    creds.width = creds.width * (ratio_h > ratio_w ? ratio_w : ratio_h);
    creds.height = creds.height * (ratio_h > ratio_w ? ratio_w : ratio_h);
    creds.centerX = game.world.width/2;
    creds.centerY = game.world.height/2;
    creds.events.onInputUp.addOnce(function(){
        console.log('des');
        this.destroy();
    },creds)
}

MenuState.prototype.returnMenu = function() {
    game.world.remove(this.displayedCredits);
}

MenuState.prototype.returnMenu = function() {
    game.world.remove(this.displayedCredits);
}