/**
 * Created by cleme on 25/02/2017.
 */
function LoadState() {
    Phaser.State.call(this);
}
LoadState.prototype = Object.create(Phaser.State.prototype);
LoadState.prototype.constructor = LoadState;

LoadState.prototype.init=function(data) {
    this.datas=data;
}

LoadState.prototype.preload=function() {
    //load images
    for(var i in this.datas.assets.image) this.load.image(i,this.datas.assets.image[i]);
    var c;
    for (var i in this.datas.assets.spritesheet) {
        c=this.datas.assets.spritesheet[i];
        this.load.spritesheet(i,c.src,c.fW,c.fH);
    }
    console.log('load img finish');

    this.load.text("levels","json/levels.json");
}

LoadState.prototype.create=function() {
    game.scale.scaleMode=game.scale.SHOW_ALL;
    game.scale.pageAlignHorizontally=true;
    game.scale.pageAlignVertically=true;
    game.renderer.renderSession.roundPixels = true;
    game.scale.forceOrientation(false,true);
    game.state.start('MenuState');
}


