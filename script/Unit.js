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
        this.degree =Math.round(180 * (p.angle) / Math.PI);
    };
    this.attackTower = function(){
    	if(this.life > 0){
    		this.animations.play("attackUp");
 
	        if(!this.last_attack) {
	            this.state.attackTower(this.id);
	            this.last_attack=game.time.now;
	        }
	        else {
	            if(game.time.now-this.last_attack>=this.attack_delay) this.last_attack=null;
	        }
    	}
    }

    this.update = function(){
        if(this.arrived) this.attackTower();
        else {

            var graph=game.add.graphics(0,0);

            this.x=this.path[this.pi].x;
            this.y=this.path[this.pi].y;
           /* graph.beginFill(0xffffff);
            graph.drawCircle(this.x,this.y,5);f
            graph.endFill()*/
            //TODO change animation if needed

            this.pi++;
            if(this.pi>=this.path.length) {
                this.arrived=true;
                this.onPathFinish.dispatch();
            } 
        
        if(typeof this.degree != 'null'){
	      	if(this.degree <= 30 && this.degree > -30) {
	      		//Right
	      		this.animations.play('runSide');
	      		this.scale.setTo(2);
	      	} else if(this.degree <= -30 && this.degree > -60){
	      		//Up Right
	      		this.animations.play('runUpSide');
	      		this.scale.setTo(2);
	      	} else if(this.degree <= -60 && this.degree > -120){
	      		//Up
	      		this.animations.play('runUp');
	       		this.angle=0;
	       		this.scale.setTo(2);
	       	} else if(this.degree <= -120 && this.degree >-150) {
	       		//Up Left
	       		this.animations.play('runUpSide'); 
	      	 	this.scale.setTo(-2,2);
	        } else if(this.degree >=-150 && this.degree >150){
	        	//Left
	        	this.animations.play('runSide');
	        	this.scale.setTo(-2,2);
	        } else if(this.degree <=150 && this.degree >120) {
	        	//Down Left
	        	this.animations.play('runDownSide'); 
	        	this.scale.setTo(-2,2);
	        } else if(this.degree <=120 && this.degree >60){
	        	//Down
	        	this.animations.play('runDown');
	        	this.scale.setTo(2);
	        } else if(this.degree <= 60 && this.degree >30){
	      		//Down Right
	      		this.animations.play('runDownSide');
	      		this.scale.setTo(2);
	      	} 
	      }

        }
        //this.attackTower(this.tower);
    }

    this.kill=function(){
    	this.animations.play('die'); 
       if(this.animations.play('die').loopCount==1) this.destroy();
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

    //Animations
    this.animations.add('runUp',[0,5,10,15,20],5,true);
    this.animations.add('runUpSide',[1,6,11,16,21],5,true);
    this.animations.add('runSide',[2,7,12,17,22],5,true);
    this.animations.add('runDownSide',[3,8,13,18,23],5,true);
    this.animations.add('runDown',[4,9,14,19,24],5,true);

    this.animations.add('attackUp',[25,30,35,40],4,true);
    this.animations.add('attackUpSide',[26,31,36,41],4,true);
    this.animations.add('attackSide',[27,32,37,42],4,true);
    this.animations.add('attackDownSide',[28,33,38,43],4,true);

    this.animations.add('die',[50,55,60],3,true);
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

    //Animations
    this.animations.add('runUp',[0,5,10,15,20],5,true);
    this.animations.add('runUpSide',[1,6,11,16,21],5,true);
    this.animations.add('runSide',[2,7,12,17,22],5,true);
    this.animations.add('runDownSide',[3,8,13,18,23],5,true);
    this.animations.add('runDown',[4,9,14,19,24],5,true);

    this.animations.add('attackUp',[25,30,35,40],4,true);
    this.animations.add('attackUpSide',[26,31,36,41],4,true);
    this.animations.add('attackSide',[27,32,37,42],4,true);
    this.animations.add('attackDownSide',[28,33,38,43],4,true);

    this.animations.add('die',[50,55,60],3,true);
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

    //Animations
    this.animations.add('runUp',[0,5,10,15,20],5,true);
    this.animations.add('runUpSide',[1,6,11,16,21],5,true);
    this.animations.add('runSide',[2,7,12,17,22],5,true);
    this.animations.add('runDownSide',[3,8,13,18,23],5,true);
    this.animations.add('runDown',[4,9,14,19,24],5,true);

    this.animations.add('attackUp',[25,30,35,40],4,true);
    this.animations.add('attackUpSide',[26,31,36,41],4,true);
    this.animations.add('attackSide',[27,32,37,42],4,true);
    this.animations.add('attackDownSide',[28,33,38,43],4,true);

    this.animations.add('die',[50,55,60],3,true);
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

    //Animations
    this.animations.add('runUp',[0,5,10,15,20],5,true);
    this.animations.add('runUpSide',[1,6,11,16,21],5,true);
    this.animations.add('runSide',[2,7,12,17,22],5,true);
    this.animations.add('runDownSide',[3,8,13,18,23],5,true);
    this.animations.add('runDown',[4,9,14,19,24],5,true);

    this.animations.add('attackUp',[25,30,35,40],4,true);
    this.animations.add('attackUpSide',[26,31,36,41],4,true);
    this.animations.add('attackSide',[27,32,37,42],4,true);
    this.animations.add('attackDownSide',[28,33,38,43],4,true);

    this.animations.add('die',[50,55,60],3,true);
}

Unit.Worker.RES_NEEDED={wood:1,
    metal:1,
    food:1
};
Unit.Worker.PROD_TIME=1000;
