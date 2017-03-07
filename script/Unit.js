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
        this.path=[];
        start=start||{"x":this.x,"y":this.y};
        if(handleS) {
            var interpol="bezierInterpolation";
            var points = {
                'x': [start.x, handleS.x, handleE.x, end.x],
                'y': [ start.y, handleS.y, handleE.y, end.y]
            }
        }
        else {
            var interpol="linearInterpolation";
            var points={
                'x': [start.x, end.x],
                'y': [ start.y, end.y]
            }
        }


        var graph=game.add.graphics(0,0);
           //draw arg point
        graph.beginFill(0xffffff);
        graph.drawCircle(end.x,end.y,10);
        graph.endFill();
        /*graph.beginFill(0xffffff);
        graph.drawCircle(handleS.x,handleS.y,10);
        graph.endFill();

        graph.beginFill(0xffffff);
        graph.drawCircle(handleE.x,handleE.y,10);
        graph.endFill();*/


        var x = 1 / game.world.width;

        for (var i = 0; i <= 1; i += x)
        {
            var px = game.math[interpol](points.x, i);
            var py = game.math[interpol](points.y, i);

            var p={"x":px,"y":py,"angle":0};
            if(this.path.length>0) {
                p.angle=game.math.angleBetweenPoints(this.path[this.path.length-1],p);
                if(Phaser.Point.distance(p,this.path[this.path.length-1])>=this.speed) {
                    this.path.push(p);
                }
            }
            else this.path.push(p);
        }
        this.pi=0;
        if(onfinish) this.onPathFinish.add(onfinish,ctx,arg);
    };
    this.attackTower = function(){
        if(!this.last_attack) {
            this.state.attackTower(this.id);
            this.last_attack=game.time.now;
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
        var dis=tower.width/2;
        var x=game.rnd.realInRange(-1,1);
        var end={
            "x":tower.x+x*dis,
            "y":tower.bottom+Math.sqrt(Math.pow(dis,2)-Math.pow((x*dis),2))
        };

        if(end.x+this.body.width/2>this.state.display.x+this.state.display.width) end.x=this.state.display.x+this.state.display.width-this.body.width/2;
        if(end.x-this.body.width/2<this.state.display.x) end.x=this.state.display.x+this.body.width/2;

        var handleE=(linear)?null:new Phaser.Circle(this.state.current.unit_path.Tx.x,this.state.current.unit_path.Tx.y,this.state.display.width*0.2).random();
        var handleS=(linear)?null:new Phaser.Circle(this.state.current.unit_path.Fx.x,this.state.current.unit_path.Fx.y,this.state.display.width*0.2).random();

        this.changePath(this,end,handleS,handleE);
    };

    this.frame=0;

    var dis=tower.width/2;
    var x=game.rnd.realInRange(-1,1);
    var end={
        "x":tower.x+x*dis,
        "y":tower.bottom+Math.sqrt(Math.pow(dis,2)-Math.pow((x*dis),2))
    };
    this.anchor.setTo(0.5);
    this.width=this.state.display.width*0.2;
    this.height=this.state.display.width*0.2;

    game.physics.arcade.enable(this);
    //this.body.collideWorldBounds=true;
    this.body.setSize(10,10,32,30);

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
    this.speed=2;
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
    this.speed=2;
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
    this.speed=2;
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
    this.speed=2;
    this.range=100;
}

Unit.Worker.RES_NEEDED={wood:1,
    metal:1,
    food:1
};
Unit.Worker.PROD_TIME=1000;
