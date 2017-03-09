/**
 * Created by cleme on 25/02/2017.
 */
function LevelState() {
    Phaser.State.call(this);
}

LevelState.prototype = Object.create(Phaser.State.prototype);
LevelState.prototype.constructor = LevelState;

LevelState.prototype.init=function(level_nb) {
    var level_param = JSON.parse(this.game.cache.getText("levels")).levels[level_nb];
    //b=game.add.image(0,0,"tower");
    this.display={
        "height":0.9*game.world.height,
        "width":game.world.width,
        "x":0,
        "y":0
        };
    this.units=[];

    this.grps={
        "terrain":game.add.group(),
        "objects":game.add.group(),
        "res":game.add.group(),
        "unit":game.add.group()
    }

    this.raw={};
    this.raw.terrains=[];
    this.raw.towers=[];
    this.raw.flags=[];
    this.raw.units_path=[];

    this.current={};//reference active flag/tower/res_area/unit_path, because some levels have multiple of these
    //a data structure representing an average path which unit will take to go to the tower
    this.current.unit_path=level_param.units_path[0];
    for(var i in this.current.unit_path) {
        for(var j in this.current.unit_path[i]) {
            this.current.unit_path[i][j]*=(j=="x")?this.display.width:this.display.height;

        }
    }
    this.raw.units_path=level_param.units_path.slice(1,level_param.units_path.length);

    //assign resources
    this.res_on_map=[];

    this.resources=new ResourceHandler(this,Math.round(level_param.res.wood*level_param.res.amount),Math.round(level_param.res.metal*level_param.res.amount),Math.round(level_param.res.food*level_param.res.amount));

    this.totalRes={"wood":level_param.res.wood-this.resources.wood,
        "metal":level_param.res.metal-this.resources.metal,
        "food":level_param.res.metal-this.resources.food};

    //create background stuff
    this.terrain={"tree":[],"grass":[],"dirt":[]};
    this.terrain.deleteAll=function(){
        for(var i in this) {
            for(var j in this[i]) {this[i][j].destroy();}
            this[i]=[];
        }
    }
    this.terrain.grass.push(game.add.tileSprite(0,0,game.world.width,this.display.height,"grass",null,this.grps.terrain));
    //this.terrain.grass[0].tileScale.setTo(1.5);
    var bmd=game.add.bitmapData(200,300);
    for(var t in level_param.terrains[0]) {//each terrain type
        var type=level_param.terrains[0][t];
        //if(t=='dirt') break;
        //console.log("t: "+t+" type: ");
        //console.log(type);
        //http://www.html5gamedevs.com/topic/7620-draw-solid-rectangle/
        var pattern=bmd.context.createPattern(game.cache.getImage(t),"repeat");
        for(var s in type) {//each shape in type
            var shape=type[s].shape;
            //console.log("s: "+s+" shape: ");
            //console.log(shape);
            bmd.clear();
            bmd.context.beginPath();
            for(var i in shape){
                var point=shape[i];
                //console.log("i: "+i+" point: ");
                //console.log(point);
                bmd.context[point.fx].apply(bmd.context,point.points);
            }
            bmd.context.fillStyle=pattern;
            bmd.context.closePath();
            bmd.context.fill();

            var x=((typeof type[s].pos.x)=="string")?game.world.width*parseFloat(type[s].pos.x):type[s].pos.x;
            var y=((typeof type[s].pos.y)=="string")?this.display.height*parseFloat(type[s].pos.y):type[s].pos.y;
            var spr=game.add.sprite(x,y,bmd.generateTexture(t+" "+s),null,this.grps.terrain);
            spr.crop(new Phaser.Rectangle(0,0,type[s].pos.width*200,type[s].pos.height*300));
            if(type[s].pos.hasOwnProperty("aX")) spr.anchor.setTo(type[s].pos.aX,type[s].pos.aY);
            spr.width=type[s].pos.width*game.world.width;
            spr.height=type[s].pos.height*this.display.height;
            this.terrain[t].push(spr);
            bmd.clear(0,0,200,300);
        }
    }
    bmd.destroy(true);
    this.raw.terrains=level_param.terrains.slice(1,level_param.terrains.length);

    //Flag
    var f=game.add.image(level_param.flags[0].x*game.world.width,level_param.flags[0].y*this.display.height,'flag',null,this.grps.objects);
    f.anchor.setTo(0.5,1);
    f.width*=this.display.height*0.15/f.height;
    f.height=this.display.height*0.15;
    this.current.flag=f;
    this.raw.flags=level_param.flags.slice(1,level_param.flags.length);

    //Tower
    this.current.tower=new Tower(level_param.towers[0],this);
    this.current.tower.events.onDestroy.add(function(){
        if(this.raw.towers.length>0) this.nextTower();
        else if(this.units.length>0) this.win=true;
    },this);
    this.raw.towers=level_param.towers.slice(1,level_param.towers.length);

    //create UI
    this.uiHandler=new UIHandler(this,level_param.units);

    this.raw.res_area=level_param.res_area;

}

LevelState.prototype.preRender=function() {
    //Create resources' spawning area
    //needs to be in preRender because some points are set relative to terrain/flag/tower
    //so sprites need to be in their final place, which is what preRender waits for
    //var g=game.add.graphics(this.display.x,this.display.y);
    if(!this.current.res_area && !this.transition) {
        var points=[];
        var bounds={
            "top":9999,
            "left":9999,
            "bottom":0,
            "right":0
        };
        Object.defineProperty(bounds,"width",{
           get:function(){return right-left;}
        });
        Object.defineProperty(bounds,"height",{
            get:function(){return bottom-top;}
        });
        for(var i in this.raw.res_area[0].points) {
            var pt={"x":0,"y":0};
            var obj=this.raw.res_area[0].points[i];
            if((typeof obj.x)=="string") {//relative to object
                var index=parseInt(obj.x.split("_")[0]);
                var side=obj.x.split("_")[1];
                if(parseInt(index)) {
                    pt.x=this.terrain.tree[parseInt(index)][side];
                }
                else pt.x=this.current[index][side];
            }
            else pt.x=this.display.x+obj.x*this.display.width/200;

            if((typeof obj.y)=="string") {//relative to object
                var index=obj.y.split("_")[0];
                var side=obj.y.split("_")[1];
                if(parseInt(index)) {
                    pt.y=this.terrain.tree[parseInt(index)][side];
                }
                else pt.y=this.current[index][side];
            }
            else pt.y=this.display.y+obj.y*this.display.height/300;
            points.push(pt);

            if(pt.x<bounds.left) bounds.left=pt.x;
            else if(pt.x>bounds.right) bounds.right=pt.x;
            if(pt.y<bounds.top) bounds.top=pt.y;
            else if(pt.y>bounds.bottom) bounds.bottom=pt.y;

        }
        this.current.res_area=new Phaser.Polygon(points);
        this.current.res_area.bounds=bounds;
        this.current.res_area.getBounds=function(){return this.bounds;};
        this.raw.res_area.splice(0,1);

        /*g.beginFill(0xffffff);
        g.drawPolygon(this.current.res_area.points);
        g.endFill();

        setTimeout(function(g){g.destroy()},2000,g);*/

        this.res_timeout=new Timer(function(state){state.spawnRes();},3000,this);
    }
}

LevelState.prototype.update=function() {

    if(this.win || this.lose()) this.backToMenu();
    game.physics.arcade.overlap(this.grps.unit,this.grps.res,function(unit,res) {
        this.collectRes(res.id,unit.id)
    },null,this);
    if(!this.current.tower.unitInRange((this.current.tower.focus))) {
        if(this.current.tower.next_to_focus.length>0) {
            this.current.tower.focus=this.current.tower.next_to_focus[0];
            this.current.tower.next_to_focus.shift();
        }
        else this.current.tower.focus=-1;
    }
    for(var i in this.units) {
        if(!this.units[i].exists) this.units.splice(i,1);
        else {
            if(this.current.tower.unitInRange(this.units[i])) {
                if(this.current.tower.focus<0) this.current.tower.focus=this.units[i].id;//Tower has no focus
                else if(this.current.tower.focus!=this.units[i].id) {//unit not focus by tower
                    if(this.current.tower.next_to_focus.indexOf(this.units[i].id)<0) this.current.tower.next_to_focus.push(this.units[i].id);
                }
            }
        }
    }
}

LevelState.prototype.paused=function() {
    console.log('pause');
    this.uiHandler.pause();
    this.res_timeout.pause();
}

LevelState.prototype.resumed=function() {
    console.log('resume');
    this.uiHandler.resume();
    this.res_timeout.resume();
}

LevelState.prototype.attackUnit=function(unit_id) {
    var u=this.getUnit(unit_id);
    u.life-=this.current.tower.damage;
    if(u.life<=0 && !u.dead) this.killUnit(unit_id);
}

LevelState.prototype.attackTower=function(unit_id) {
    if(this.current.tower.dead) return false;
    this.current.tower.life-=this.getUnit(unit_id).damage;
    return true;
}

LevelState.prototype.killUnit=function(unit_id) {
    this.getUnit(unit_id).kill();
    if(this.current.tower.focus==unit_id) {
        this.current.tower.focus=-1;
        if(this.current.tower.next_to_focus.length>0) {
            this.current.tower.focus=this.current.tower.next_to_focus[0];
            this.current.tower.next_to_focus.shift();
        }
    }

}

LevelState.prototype.canCreateUnit=function(unit_type) {
    var res_need=Unit[unit_type.capitalizeFirstLetter()].RES_NEEDED;
    return (this.resources.wood>=res_need.wood && this.resources.metal>=res_need.metal && this.resources.food>=res_need.food);

}

LevelState.prototype.createUnit=function(unit_type) {
    this.units.push(new Unit(unit_type,this.current.flag,this.current.tower,this));
    var res_need=Unit[unit_type.capitalizeFirstLetter()].RES_NEEDED;
    this.resources.wood=this.resources.wood-res_need.wood;
    this.resources.metal=this.resources.metal-res_need.metal;
    this.resources.food=this.resources.food-res_need.food;
}

LevelState.prototype.onResourceTap=function(res_id) {
    var id, minDist=99999,res=this.getRes(res_id);
    for(var i in this.units) {
        var d=game.physics.arcade.distanceBetween(this.units[i],res);
        if(d<minDist) {
            minDist=d;
            id = this.units[i].id;
        }
    }
    if(id<0) return;
    //this.getUnit(id).fetch_res=res_id;
    this.getUnit(id).changePath(null,{"x":res.x,"y":res.y});
}

LevelState.prototype.collectRes=function(res_id,unit_id) {
    for(var i in this.res_on_map) {
        if(this.res_on_map[i].id==res_id) {
            this.resources[this.res_on_map[i].type]++;
            this.res_on_map[i].destroy();
            this.res_on_map.splice(i,1);
            break;
        }
    }
    this.uiHandler.checkCanCreate();
    //console.log(this.resources);
    this.getUnit(unit_id).goToTower(this.current.tower,true);
}

LevelState.prototype.spawnRes=function() {
    if(this.res_on_map.length<5) {
        var type;
        do{
            var r=game.rnd.integerInRange(0,2);
            switch(r) {
                case 0:
                    if(this.totalRes.wood>0) type="wood";
                    break;
                case 1:
                    if(this.totalRes.metal>0) type = "metal";
                    break;
                case 2:
                    if(this.totalRes.food>0) type="food";
            }
        }while(!type)
        this.totalRes[type]--;
        var good=false;
        var x,y;
        do {
            x=game.rnd.between(this.current.res_area.getBounds().left,this.current.res_area.getBounds().right);
            y=game.rnd.between(this.current.res_area.getBounds().top,this.current.res_area.getBounds().bottom);
            good=this.current.res_area.contains(x,y);
        }while(!good)
        this.res_on_map.push(new Resource(type,x,y,this));
    }
    this.res_timeout=new Timer(function(state){state.spawnRes();},game.rnd.between(2000,4000),this);
}

LevelState.prototype.nextTower=function() {
    console.log('next');
    this.uiHandler.pause();
    this.res_timeout.pause();
    //set new terrain coord
    var x,y;
    if(this.raw.terrains[0].pos.align=='top') {//not implemented for other sides
        x=game.world.bounds.left+this.raw.terrains[0].pos.offset*this.display.width;
        y=game.world.bounds.top-this.display.height;
    }
    console.log(x+" "+y);
    //create sprite accordingly
    this.next_terrain={"tree":[],"grass":[],"dirt":[]};
    this.next_terrain.grass.push(game.add.tileSprite(x,y,this.display.width,this.display.height,"grass",null,this.grps.terrain));
    var bmd=game.add.bitmapData(200,300);
    for(var t in this.raw.terrains[0]) {//each terrain type
        if(this.terrain.hasOwnProperty(t)) {
            var type = this.raw.terrains[0][t];
            //http://www.html5gamedevs.com/topic/7620-draw-solid-rectangle/
            var pattern = bmd.context.createPattern(game.cache.getImage(t), "repeat");
            for (var s in type) {//each shape in type
                var shape = type[s].shape;
                bmd.context.beginPath();
                for (var i in shape) {
                    var point = shape[i];
                    bmd.context[point.fx].apply(bmd.context,point.points);
                }
                bmd.context.fillStyle = pattern;
                bmd.context.closePath();
                bmd.context.fill();

                var x1 = ((typeof type[s].pos.x) == "string") ? x+this.display.width* parseFloat(type[s].pos.x) : x+type[s].pos.x;
                var y1 = ((typeof type[s].pos.y) == "string") ? y+this.display.height * parseFloat(type[s].pos.y) :y+ type[s].pos.y;
                var spr = game.add.sprite(x1, y1, bmd.generateTexture(),0,this.grps.terrain);
                spr.crop(new Phaser.Rectangle(0,0,type[s].pos.width*200,type[s].pos.height*300));
                if (type[s].pos.hasOwnProperty("aX")) spr.anchor.setTo(type[s].pos.aX, type[s].pos.aY);
                spr.width = type[s].pos.width * this.display.width;
                spr.height = type[s].pos.height * this.display.height;
                this.next_terrain[t].push(spr);
                bmd.clear(0,0,200,300);
            }
        }
    }
    this.raw.terrains.shift();

    //create new flag and tower
    this.current.flag.x=x+this.display.width*this.raw.flags[0].x;
    this.current.flag.y=y+this.display.height*this.raw.flags[0].y;
    this.raw.flags.shift();


    this.current.tower=new Tower(this.raw.towers[0],this);
    this.current.tower.x+=x;
    this.current.tower.y+=y;
    this.raw.towers.shift();

    //reset unit path
    this.current.unit_path=this.raw.units_path[0];
    for(var i in this.current.unit_path) {
        for(var j in this.current.unit_path[i]) {
            this.current.unit_path[i][j]*=(j=="x")?this.display.width:this.display.height;
            this.current.unit_path[i][j]+=(j=="x")?x:y;

        }
    }
    this.raw.units_path.shift();

    this.current.res_area=null;
    //set units new goal to flag
    var maxDist=0,index=0;
    for(var i in this.units) {
        this.units[i].changePath(null,new Phaser.Circle(this.current.flag.x,this.current.flag.y,this.display.width*0.1).random(),null,null,function(){
            this.goToTower(this.state.current.tower);
        },this.units[i]);
        var d=Phaser.Point.distance(this.current.tower,this.units[i]);
        if(d>maxDist) {
            maxDist=d;
            index=i;
        }
    }
    for(var i in this.res_on_map) {
        this.res_on_map[i].destroy();
    }
    this.res_on_map=[];
    game.world.setBounds((x<0)?x:0,(y<0)?y:0,Math.abs(x)+this.display.width,this.display.height*2);

    //center camera on units
    var t=game.add.tween(game.camera).to({"x":x,"y":y},3000,Phaser.Easing.Linear.In,true);
    t.onComplete.add(function(c) {
        this.terrain.deleteAll();
        this.terrain=this.next_terrain;
        this.next_terrain=null;
        //game.world.setBounds(c.x,c.y,this.display.width,c.height);
        this.display.x=x;
        this.display.y=y;
        for(var i in this.uiHandler.buttons) this.uiHandler.buttons[i].setMask();
        this.uiHandler.resume();
        this.res_timeout.resume();
        this.transition=false;
    },this);

    this.transition=true;
}

LevelState.prototype.lose=function() {
    var can=false;
    for(var i in this.uiHandler.buttons) {
        can=can || this.canCreateUnit(this.uiHandler.buttons[i].unit_type);
    }
    return !can && this.units.length==0 && this.current.tower.life>0;
}

LevelState.prototype.getUnit=function(id) {
    for(var i in this.units) if(this.units[i].id==id) return this.units[i];
}

LevelState.prototype.getRes=function(id) {
    for(var i in this.res_on_map) if(this.res_on_map[i].id==id) return this.res_on_map[i];
}

LevelState.prototype.backToMenu=function() {
    this.uiHandler().pause();
    this.res_timeout.pause();
    console.log('ToMenu');
    //game.state.start('MenuState');
}

LevelState.prototype.render=function() {
    game.debug.text(game.time.fps || '--',20, 100, "#000000");
    //game.debug.spriteBounds(this.current.tower,'red',false);
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}