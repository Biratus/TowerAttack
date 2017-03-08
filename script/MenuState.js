/**
 * Created by cleme on 25/02/2017.
 */
function MenuState() {
    Phaser.State.call(this);
}

MenuState.prototype = Object.create(Phaser.State.prototype);
MenuState.prototype.constructor = MenuState;

MenuState.prototype.create=function() {
    this.bg = game.add.image(0, 0, 'bg_menu');
    this.bg.width=game.world.width;
    this.bg.height=game.world.height;
    
    this.level1 = game.add.button(game.world.centerX - 95, 200, 'b_level1', this.startLevel, this, 2, 1, 0);
    this.level1.toLevel=0;
    this.level2 = game.add.button(game.world.centerX - 95, 255, 'b_level2', this.startLevel, this, 2, 1, 0);
    this.level1.toLevel=1;
    this.level3 = game.add.button(game.world.centerX - 95, 310, 'b_level3', null, this, 2, 1, 0);

    this.credits = game.add.button(game.world.centerX - 95, 355, 'b_credits', this.credits, this, 2, 1, 0);
}

MenuState.prototype.startLevel= function(button) {
    game.state.start('LevelState',true,false,button.toLevel);
}

MenuState.prototype.credits = function() {
    this.displayedCredits = game.add.button(0, 0, 'bg_menu', this.returnMenu, this, 2, 1, 0);
}

MenuState.prototype.returnMenu = function() {
    game.world.remove(this.displayedCredits);
}