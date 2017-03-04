/**
 * Created by cleme on 25/02/2017.
 */
var id_count=0;

function Unit(name,flag,tower,state) {
    Phaser.Sprite.call(this,game,0,0,name);
    Unit[name.capitalizeFirstLetter()].apply(this);

    this.id=id_count++;
    this.name=name;
    this.state=state;

    this.path=[];
    this.onPathFinish=new Phaser.Signal();

    this.changePath = function(start,end,handleS,handleE,onfinish,ctx,arg){

        this.arrived=false;
        start=start||{"x":this.x,"y":this.y};
        handleS=handleS||start;
        handleS=handleS||start;
        var points = {
            'x': [start.x, handleS.x, handleE.x, end.x],
            'y': [ start.y, handleS.y, handleE.y, end.y]
        }

        var graph=game.add.graphics(0,0);
           //draw arg point
        /*graph.beginFill(0xffffff);
        graph.drawCircle(start.x,start.y,10);
        graph.endFill();
        graph.beginFill(0xffffff);
        graph.drawCircle(end.x,end.y,10);
        graph.endFill();
        graph.beginFill(0xffffff);
        graph.drawCircle(handleS.x,handleS.y,10);
        graph.endFill();

        graph.beginFill(0xffffff);
        graph.drawCircle(handleE.x,handleE.y,10);
        graph.endFill();*/


        var x = this.speed / game.world.width;

        for (var i = 0; i <= 1; i += x)
        {
            var px = game.math.bezierInterpolation(points.x, i);
            var py = game.math.bezierInterpolation(points.y, i);
            //draw path
            /*graph.beginFill(0xffffff);
            graph.drawCircle(px,py,5);
            graph.endFill();*/

            var p={"x":px,"y":py,"angle":0};
            if(i>0) p.angle=game.math.angleBetweenPoints(this.path[this.path.length-1],p);
            this.path.push(p);
        }
        this.pi=0;
        if(onfinish) this.onPathFinish.add(onfinish,ctx,arg);
    };
    this.attackTower = function(){
        if(!this.last_attack) {
            this.state.attackTower(this.id);
            this.last_attack=game.time.now;
            console.log('unit attack');
        }
        else {
            if(game.time.now-this.last_attack>=this.attack_delay) this.last_attack=null;
        }
    }

    this.update = function(){
        if(this.arrived) this.attackTower();
        else {
            var graph=game.add.graphics(0,0);
            this.x=this.path[this.pi].x;
            this.y=this.path[this.pi].y;
           /* graph.beginFill(0xffffff);
            graph.drawCircle(this.x,this.y,5);
            graph.endFill()*/
            //TODO change animation if needed

            this.pi++;
            if(this.pi>=this.path.length) {
                this.arrived=true;
                this.onPathFinish.dispatch();
            }

        }
        //this.attackTower(this.tower);
    }

    this.kill=function(){
        this.destroy();
        //this.animations.play('die',20,false,true);
    }

    this.goToTower=function(tower,linear) {


        var end={"x":game.rnd.between(-1,1),"y":game.rnd.between(0,-1)};
        var dis=game.rnd.between(0,this.range);
        end.x=tower.getBounds().centerX+(Math.cos(end.x)*dis);
        end.y=tower.getBounds().bottom-(Math.sin(end.x)*dis);

        if(end.x+this.body.width/2>this.state.display.x+this.state.display.width) end.x=this.state.display.x+this.state.display.width-this.body.width/2;
        if(end.x-this.body.width/2<this.state.display.x) end.x=this.state.display.x+this.body.width/2;

        var handleE=(linear)?null:new Phaser.Circle(this.state.current.unit_path.Tx.x,this.state.current.unit_path.Tx.y,this.state.display.width*0.2).random();
        var handleS=(linear)?null:new Phaser.Circle(this.state.current.unit_path.Fx.x,this.state.current.unit_path.Fx.y,this.state.display.width*0.2).random();

        this.changePath(this,end,handleS,handleE);
    };

    this.frame=0;

    var end={"x":game.rnd.between(-1,1),"y":game.rnd.between(0,-1)};
    var dis=game.rnd.between(0,this.range);
    end.x=tower.getBounds().centerX+(Math.cos(end.x)*dis);
    end.y=tower.getBounds().bottom-(Math.sin(end.x)*dis);
    this.anchor.setTo(0.5);
    this.width=this.state.display.width*0.2;
    this.height=this.state.display.width*0.2;

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds=true;
    this.body.setSize(this.width/2,this.height/2);

    if(end.x+this.body.width/2>this.state.display.x+this.state.display.width) end.x=this.state.display.x+this.state.display.width-this.body.width/2;
    if(end.x-this.body.width/2<this.state.display.x) end.x=this.state.display.x+this.body.width/2;

    this.changePath(
        new Phaser.Circle(flag.x,flag.y,this.state.display.width*0.1).random(),
        end,
        new Phaser.Circle(this.state.current.unit_path.Fx.x,this.state.current.unit_path.Fx.y,this.state.display.width*0.2).random(),
        new Phaser.Circle(this.state.current.unit_path.Tx.x,this.state.current.unit_path.Tx.y,this.state.display.width*0.2).random()
    );

    state.grps.unit.add(this)
}

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.Melee=function() {
    //Stats
    this.life=20;
    this.damage=10;
    this.attack_delay=2000;
    this.speed=1;
    this.range=100;
}

Unit.Melee.RES_NEEDED={wood:1,
    metal:1,
    food:1
};
Unit.Melee.PROD_TIME=1000;

Unit.Tank=function() {
    //Stats
    this.life=20;
    this.damage=10;
    this.attack_delay=2000;
    this.speed=1;
    this.range=100;
}

Unit.Tank.RES_NEEDED={wood:1,
    metal:1,
    food:1
};
Unit.Tank.PROD_TIME=1000;

Unit.Archer=function() {
    //Stats
    this.life=5;
    this.damage=1;
    this.attack_delay=2000;
    this.speed=1;
    this.range=100;
}

Unit.Archer.RES_NEEDED={wood:1,
    metal:1,
    food:1
};
Unit.Archer.PROD_TIME=1000;

Unit.Worker=function() {
    //Stats
    this.life=20;
    this.damage=10;
    this.attack_delay=2000;
    this.speed=1;
    this.range=100;
}

Unit.Worker.RES_NEEDED={wood:1,
    metal:1,
    food:1
};
Unit.Worker.PROD_TIME=1000;
