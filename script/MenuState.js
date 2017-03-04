/**
 * Created by cleme on 25/02/2017.
 */
function MenuState() {
    Phaser.State.call(this);
}

MenuState.prototype = Object.create(Phaser.State.prototype);
MenuState.prototype.constructor = MenuState;

MenuState.prototype.create=function() {
    game.state.start('LevelState',true,false,0);
}
