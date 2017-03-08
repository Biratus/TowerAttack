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
    
    this.level1 = game.add.button(game.world.centerX - 95, 200, 'b_level1', this.startLevel, this, 2, 1, 0);
    this.level2 = game.add.button(game.world.centerX - 95, 255, 'b_level2', this.startLevel, this, 2, 1, 0);
    this.level3 = game.add.button(game.world.centerX - 95, 310, 'b_level3', this.startLevel, this, 2, 1, 0);

    this.credits = game.add.button(game.world.centerX - 95, 355, 'b_credits', this.credits, this, 2, 1, 0);
}

MenuState.prototype.update=function() {

}

MenuState.prototype.startLevel= function() {
    game.state.start('LevelState',true,false,0);
}

MenuState.prototype.credits = function() {
    this.displayedCredits = game.add.button(0, 0, 'bg_menu', this.returnMenu, this, 2, 1, 0);
}

MenuState.prototype.returnMenu = function() {
    game.world.remove(this.displayedCredits);
}