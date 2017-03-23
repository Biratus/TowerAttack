function MenuState() {
    Phaser.State.call(this);
}

MenuState.prototype = Object.create(Phaser.State.prototype);
MenuState.prototype.constructor = MenuState;

MenuState.prototype.create=function(r) {

    var bg = game.add.image(0, 0, 'bg_menu');
    var ratio_h = game.world.height/bg.height;
    var ratio_w = game.world.width/bg.width;
    bg.width = bg.width * (ratio_h > ratio_w ? ratio_w : ratio_h);
    bg.height = bg.height * (ratio_h > ratio_w ? ratio_w : ratio_h);
    bg.centerX = game.world.width/2;
    bg.centerY = game.world.height/2;

    var g = game.add.group();
    g.inputEnableChildren = true;
    g.classType = Phaser.Image;
    g.createMultiple(1, ['b_level1', 'b_level2', 'b_level3', 'b_credits'], 0, true);
    g.onChildInputUp.add(this.startLevel, this);
    g.align(1,4,game.world.width*0.75,game.world.height*0.1);
    g.alignIn(game.world.bounds, Phaser.CENTER);

    if(r) {
        this.music = game.add.audio('title');
        this.music.loop = true;
        this.music.play();
    }

}

MenuState.prototype.startLevel= function(button) {
    var lvl=0;
    var key=button.key.charAt(button.key.length-1);
    try {
        lvl=parseInt(key)-1;
    }catch(e) {console.error(e);}
    game.state.clearCurrentState();
    console.log('lvl: ', lvl);
    if(isNaN(lvl)) {
        this.credits()
    } else {
        this.music.stop();
        game.state.start('LevelState', true, false, lvl);
    }
}

MenuState.prototype.credits = function() {
    var creds = game.add.button(0, 0, 'bg_credits', function() {this.create(false);}, this);
    var ratio_h = game.world.height/creds.height;
    var ratio_w = game.world.width/creds.width;
    creds.width = creds.width * (ratio_h > ratio_w ? ratio_w : ratio_h);
    creds.height = creds.height * (ratio_h > ratio_w ? ratio_w : ratio_h);
    creds.centerX = game.world.width/2;
    creds.centerY = game.world.height/2;
}

MenuState.prototype.returnMenu = function() {
    game.world.remove(this.displayedCredits);
}