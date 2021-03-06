var res_id_count=0;

function Resource(type,x,y,state) {
    Phaser.Sprite.call(this,game,x,y,"res_"+type);

    this.state=state;
    this.id=res_id_count++;
    this.inputEnabled=true;
    this.type=type;

    this.height*=this.state.display.width*0.07/this.width;
    this.width=this.state.display.width*0.07;

    this.x+=this.width/2;
    this.y+=this.height/2
    this.anchor.setTo(0.5);

    game.physics.arcade.enable(this);

    this.state.grps.res.add(this);

    this.events.onInputUp.add(function() {
        this.state.onResourceTap(this.id);
    },this);
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

//type: "wood" "metal" "food"