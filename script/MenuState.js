function MenuState() {
    Phaser.State.call(this);
}

MenuState.prototype = Object.create(Phaser.State.prototype);
MenuState.prototype.constructor = MenuState;

MenuState.prototype.create=function() {

    var bg = game.add.image(0, 0, 'bg_menu');
    var ratio_h = game.world.height/bg.height;
    console.log('ratio_h: ', ratio_h);
    var ratio_w = game.world.width/bg.width;
    console.log('ratio_w: ', ratio_w);
    console.log('bg.height: ', bg.height);
    console.log('bg.width: ', bg.width);
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
}

MenuState.prototype.startLevel= function(button) {
    game.state.start('LevelState',true,false,0);
}

MenuState.prototype.credits = function() {
    this.displayedCredits = game.add.button(0, 0, 'bg_menu', this.returnMenu, this, 2, 1, 0);
}

MenuState.prototype.returnMenu = function() {
    game.world.remove(this.displayedCredits);
}