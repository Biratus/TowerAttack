/**
 * Created by cleme on 02/03/2017.
 */

/**
 * Interface gestion
 */
function UIHandler (state, units){

    Phaser.Group.call(this,game);

    this.state = state;

    this.menu_b=game.add.button(20, 20, "menu",function(){this.actionOnClickMenu();}, this, 0,0,0,0,this);
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

    this.buttons=this.create_group.b_grp.children;//handy reference to all unit buttons

    for(var i = 0; i < units.length ; i++){
        //console.log(cell_size/2+i*game.world.width/units.length+" "+bg.centerY);
        var b=game.add.button(this.create_group.cell_size*(i+0.5),bg.centerY,units[i]+"_button",null,null,0,0,1);

        b.anchor.setTo(0.5);
        b.width*=0.9*bg.height/b.height;
        b.height=0.9*bg.height;
        b.events.onInputUp.add(function(){this.uiHandler.onUnitClick(this);},b);

        b.frame=0;

        b.setMask=function() {
            this.graph=this.graph || game.add.graphics(0,0);
            this.graph.mask=this.graph.mask || game.add.graphics(0,0);
            this.graph.mask.lineStyle(1, 0xffffff);
            this.graph.mask.beginFill(0xffffff);
            this.graph.mask.drawRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
        }

        b.setMask();

        b.unit_type=units[i];

        b.uiHandler=this;

        this.create_group.b_grp.add(b);
    }
    this.create_group.add(this.create_group.b_grp);

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

    if(this.create_group.bg.y!=game.camera.view.bottom) {
        this.menu_b.x=game.camera.x+20;
        this.menu_b.y=game.camera.y+20;

        var add={"x":game.camera.x-this.create_group.bg.x,
        "y":game.camera.view.bottom-this.create_group.bg.y};
        this.create_group.bg.x+=add.x;
        this.create_group.bg.y+=add.y;

        for(var i in this.create_group.b_grp.children) {
            this.create_group.b_grp.children[i].x+=add.x;
            this.create_group.b_grp.children[i].y+=add.y;
        }
    }
    if(this.state.transition) return;
    for(var i in this.buttons) {
        var o=this.buttons[i];
        o.graph.clear();
        o.graph.lineStyle(1, 0xffffff, 0.4);
        o.graph.beginFill(0xffffff, 0.4);
        if( o.timer && o.timer.isRunning){
            //Get the remaining time
            var ration = o.timer.timeRemaining()*360 / Unit[o.unit_type.capitalizeFirstLetter()].PROD_TIME;
            o.graph.arc(o.x, o.y, game.math.distance(o.x,o.y,o.getBounds().top,o.getBounds().left), 0, game.math.degToRad(ration), true, 128);
        }
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