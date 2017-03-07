/**
 * Created by cleme on 25/02/2017.
 */
var tower_id_count=0;

function Tower(param,state) {
    Phaser.Sprite.call(this,game,0,0,param.img);
    this.id=tower_id_count++;
    this.state=state;

    this.anchor.setTo(0.5);

    this.x=this.state.display.width*parseFloat(param.x);
    this.y=this.state.display.height*parseFloat(param.y);

    this.width*=this.state.display.height*0.15/this.height;
    this.height=this.state.display.height*0.15;

    this.state.grps.objects.add(this);

    this.range=parseFloat(param.range)*this.state.display.height;
    this.damage=param.dmg;
    this.attack_delay=param.attack_delay;
    this.last_attack=null;
    this.life=param.life;

    /*this.life_grp=game.add.group();
    var bg=game.add.image(0,0,'life_bg',0,this.life_grp);
    this.life_grp.bar=game.add.image(1,1,'life_bar',0,this.life_grp);
    this.life_grp.coef=38/this.life;

    this.life_grp.x=this.x-bg.width/2;
    this.life_grp.y=this.getBounds().top-5-bg.height;*/

    var _focus=-1;
    this.next_to_focus=[];
    Object.defineProperty(this,'focus',{
        get:function(){return _focus},
       set:function(val) {
           _focus=val;
           if(val>=0) this.last_attack=game.time.now-this.attack_delay/2;
       }
    });
}
Tower.prototype = Object.create(Phaser.Sprite.prototype);
Tower.prototype.constructor = Tower;

Tower.prototype.update=function() {
    if(this.focus>=0) {
        if(!this.last_attack || game.time.now-this.last_attack>=this.attack_delay) {
            this.state.attackUnit(this.focus);
            this.last_attack=game.time.now;
        }
    }
    if(this.life<=0 && !this.dead) {
        this.dead=true;
        /*var burn=game.add.sprite(this.x,this.y,"flame",0);
        burn.anchor.setTo(0.5);
        burn.animations.add('burn');
        var a=burn.animations.play('burn',20,false,true);
        a.onComplete.add(function(){
            this.destroy();
        },this);*/
        this.destroy();// -> will call onDestroy event -> check LevelState.init (at the end) to see tower.onDestroy callback
    }
    //this.life_grp.bar.width=this.life*this.life_grp.coef;

}

Tower.prototype.unitInRange=function(unit) {
    return Phaser.Point.distance(this,unit,true)<=this.range;
}