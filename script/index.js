/**
 * Created by cleme on 25/02/2017.
 */
var game;
$(document).ready(function(){
    game = new Phaser.Game("100","100",Phaser.CANVAS);


    game.state.add('BootState',new BootState());
    game.state.add('LoadState',new LoadState());
    game.state.add('MenuState',new MenuState());
    game.state.add('LevelState',new LevelState());

    game.state.start('BootState');
});