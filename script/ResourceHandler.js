/**
 * Created by cleme on 07/03/2017.
 */

function ResourceHandler(state,w,m,f) {
    Phaser.Group.call(this,game);

    var _wood=w;
    var _metal=m;
    var _food=f;
    this.state=state;

    Object.defineProperty(this,"wood",{
        set:function(val) {
            _wood=val;
            this.text.wood.text=_wood;
        },
        get:function(){return _wood;}
    });
    Object.defineProperty(this,"metal",{
        set:function(val) {
            _metal=val;
            this.text.metal.text=_metal;
        },
        get:function(){return _metal;}
    });
    Object.defineProperty(this,"food",{
        set:function(val) {
            _food=val;
            this.text.food.text=_food;
        },
        get:function(){return _food;}
    });
    this.bg=game.add.image(0,0,"bg_ui",0,this);
    this.bg.width=this.state.display.width*0.35;
    this.bg.height=this.state.display.height*0.05;

    var cell_s=this.bg.width/6;
    this.text={"wood":0,"metal":0,"food":0};
    this.int_to_res=["wood","metal","food"];

    for(var i=0;i<3;i++) {
        var img=game.add.image(cell_s*(0.5+i*2),this.bg.height/2,"icon_"+this.int_to_res[i],0,this);
        img.anchor.setTo(0.5);
        img.width*=this.bg.height*0.9/img.height;
        img.height=this.bg.height*0.9;
        if(img.width>cell_s) {
            img.height*=cell_s/img.width;
            img.width=cell_s;
        }
    }
    for(var i=0;i<3;i++) {
        var t=game.add.text(cell_s*(1+i*2),this.bg.height/2,this[this.int_to_res[i]],{
            "fill":"white"
        },this);
        this.text[this.int_to_res[i]]=t;
    }
    this.x=this.state.display.width-this.bg.width;
    this.y=this.state.display.height-this.bg.height;
}

ResourceHandler.prototype = Object.create(Phaser.Group.prototype);
ResourceHandler.prototype.constructor = ResourceHandler;

ResourceHandler.prototype.update=function() {
    if(this.right!=game.camera.view.right) {
        this.y=game.camera.y+this.state.display.height-this.height;
        this.x=game.camera.view.right-this.width;
    }
}