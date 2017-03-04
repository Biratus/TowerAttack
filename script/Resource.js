/**
 * Created by cleme on 25/02/2017.
 */
var res_id_count=0;

function Resource(type,x,y,state) {
    Phaser.Sprite.call(this,game,x,y,"res_"+type);

    this.state=state;
    this.id=res_id_count++;
    this.inputEnabled=true;
    this.type=type;

    this.height*=this.state.display.width*0.1/this.width;
    this.width=this.state.display.width*0.1;

    this.state.grps.res.add(this);

    this.events.onInputUp.add(function() {
        this.state.onResourceTap(this.id);
    },this);
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

//type: "wood" "metal" "food"