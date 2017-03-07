/**
 * Created by cleme on 02/03/2017.
 */

/**
 * Interface gestion
 */
function UIHandler (state, units){

    Phaser.Group.call(this,game);

    this.state = state;

    this.buttons=[];

    this.menu_b=game.add.button(20, 20, "menu",function(){this.actionOnClickMenu();}, this, 0);
    this.menu_b.height*=this.state.display.width*0.15/this.menu_b.width;
    this.menu_b.width=this.state.display.width*0.15;

    this.create_group=game.add.group();

    var bg=game.add.image(0,game.world.height,"bg_ui");
    bg.anchor.setTo(0,1);
    bg.width=game.world.width;
    bg.height=game.world.height*0.1;

    this.create_group.add(bg);
    this.create_group.bg=bg;//a direct reference to the bg
    this.create_group.b_grp=game.add.group();
    this.create_group.cell_size=this.state.display.width/units.length;

    for(var i = 0; i < units.length ; i++){
        //console.log(cell_size/2+i*game.world.width/units.length+" "+bg.centerY);
        var b=game.add.button(this.create_group.cell_size*(i+0.5),bg.centerY,units[i]+"_button",function(){this.uiHandler.onUnitClick(this);},0,0,1,null,this.create_group.b_grp);

        b.anchor.setTo(0.5);
        b.width*=0.9*bg.height/b.height;
        b.height=0.9*bg.height;

        //console.log(b.width+" "+b.height);

        b.graph=game.add.graphics(0,0);
        b.graph.mask=game.add.graphics(0,0);
        b.graph.mask.lineStyle(1, 0xffffff);
        b.graph.mask.beginFill(0xffffff);
        b.graph.mask.drawRect(b.x-b.width/2, b.y-b.height/2, b.width, b.height);

        b.unit_type=units[i];

        b.uiHandler=this;

        this.buttons.push(b);
    }
}

UIHandler.prototype = Object.create(Phaser.Group.prototype);
UIHandler.prototype.constructor = UIHandler;

UIHandler.prototype.onUnitClick=function(button) {
    button.input.enabled=false;
    button.timer=new Timer(function(b){
        b.uiHandler.state.createUnit(b.unit_type);
        b.input.enabled=b.uiHandler.state.canCreateUnit(b.unit_type);
        //t.buttonUnitRange.frame=0;
        b.timer=null;
    }, Unit[button.unit_type.capitalizeFirstLetter()].PROD_TIME ,button);

}

UIHandler.prototype.checkCanCreate=function() {
    for(var i in this.buttons) {
        if(!this.buttons[i].timer || !this.buttons[i].timer.isRunning) {
            if(this.state.canCreateUnit(this.buttons[i].unit_type)) this.buttons[i].input.enabled=true;
            else this.buttons[i].input.enabled=false;
        }

    }
}

UIHandler.prototype.pause=function() {
    for(var i in this.buttons) if(this.buttons[i].timer) this.buttons[i].timer.pause();
}
UIHandler.prototype.resume=function() {
    for(var i in this.buttons) if(this.buttons[i].timer) this.buttons[i].timer.resume();
}

//During the update, we look if the buttons are clickable
UIHandler.prototype.update = function(){

    if(this.create_group.bg.y>game.camera.view.bottom) {
        console.log("move");
        var add={"x":game.view.camera.x-this.create_group.bg.x,
        "y":game.camera.view.bottom-this.create_group.bg.y};
        for(var i in this.create_group.children) {
            this.create_group.children[i].x+=add.x;
            this.create_group.children[i].y+=add.y;
        }
    }
    this.menu_b.x=game.camera.x+20;
    this.menu_b.y=game.camera.y+20;

    if(this.state.transition) return;
    for(var i in this.buttons) {
        var o=this.buttons[i];
        o.graph.clear();
        o.graph.lineStyle(1, 0xffffff, 0.4);
        o.graph.beginFill(0xffffff, 0.4);
        if( o.timer && o.timer.isRunning){
            //Get the remaining time
            var ration = o.timer.timeRemaining()*360 / Unit[o.unit_type.capitalizeFirstLetter()].PROD_TIME;
            o.graph.arc(o.x, game.camera.height* (90/100), this.state.display.width/8, 0, game.math.degToRad(ration), true, 128);
        }/*else{
            //Ask if we can create a range unit
            if(this.state.canCreateUnit(o.unit_type)) o.input.Enabled = true;
            else o.input.enabled = false;
        }*/
        o.graph.endFill();
    }
}

//Go to menu
UIHandler.prototype.actionOnClickMenu = function() {
    this.state.backToMenu();
}


//Function use to create a timer
function Timer(callback, delay,ctx,arg) {
    this.timerId, this.start, this.remaining = delay;
    this.ctx=ctx,this.arg=arg,this.callback=callback,this.isRunning=false;

    this.pause = function() {
        clearTimeout(this.timerId);
        this.isRunning=false;
        this.remaining = this.remaining-(new Date().getTime() - this.start);
    };
    //Timer doesn't call the callback in its context, the context is given as an argument
    this.resume = function() {
        if(this.isRunning) return;
        this.start = new Date().getTime();
        this.timerId = setTimeout(this.callback, this.remaining,this.ctx,this.arg);
        this.isRunning=true;
    };
    this.timeRemaining=function() {
        return this.remaining-(new Date().getTime() - this.start);//this.start+this.remaining-new Date().getTime();
    }
    this.resume();
    this.isRunning=true;
}