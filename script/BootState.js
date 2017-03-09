/**
 * Created by cleme on 25/02/2017.
 */
function BootState() {
    Phaser.State.call(this);
}
BootState.prototype = Object.create(Phaser.State.prototype);
BootState.prototype.constructor = BootState;

BootState.prototype.preload=function() {
    game.time.advancedTiming = true;
    this.load.text("assets","json/assets.json");
}

BootState.prototype.create=function() {
    var assets=JSON.parse(this.game.cache.getText("assets"));
    game.state.start("LoadState",true,false,assets);
}