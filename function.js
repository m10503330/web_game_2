
var Vector = function(x,y){
    this.x=x || 0;
    this.y=y || 0;
}
Vector.prototype.add = function(v){
    return new Vector(this.x+v.x,this.y+v.y);
}
Vector.prototype.sub = function(v){
    return new Vector(this.x-v.x,this.y-v.y);
}
Vector.prototype.length = function(){
    return Math.sqrt(this.x*this.x+this.y*this.y);
}
Vector.prototype.set = function(x,y){
    this.x=x;
    this.y=y;
}
Vector.prototype.equal = function(v){
    return this.x==v.x && this.y==v.y;
}
Vector.prototype.mul = function(num){
    return new Vector(this.x*num,this.y*num);
}
Vector.prototype.clone = function(num){
    return new Vector(this.x,this.y);
}
var Snake=function(){
    this.body=[];
    this.maxLength=5;
    this.head=new Vector(0,0);
    this.speed=new Vector(1,0);
    this.direction="right";
}
Snake.prototype.setdirection=function(dir){
    let target 
    if(dir=="Up"){
        target=new Vector(0,-1);
    }
    if(dir=="Down"){
        target=new Vector(0,1);
    }
    if(dir=="Left"){
        target=new Vector(-1,0);
    }
    if(dir=="Right"){
        target=new Vector(1,0);
    }
    if(target.equal(this.speed.mul(-1))==false){
        this.speed = target;
    }
    
}
Snake.prototype.update = function(){
    let newHead = this.head.add(this.speed);
    this.body.push(this.head);
    this.head=newHead;
    while(this.body.length>this.maxLength)
    {
        this.body.shift();
    }
}
var Game = function (){
    this.bw=12;
    this.bs=2;
    this.gameWidth=40;
    this.speed=5;
    this.snake=new Snake();
    this.foods=[];
    this.start = false;
}
Snake.prototype.checkBoundary = function(gameWidth){
    let xInrange = 0 <= this.head.x && this.head.x < gameWidth;
    let yInrange = 0 <= this.head.y && this.head.y < gameWidth;
    return xInrange && yInrange
}

Game.prototype.init = function(){
    this.canvas = document.querySelector("#mycanvas")
    this.canvas.width=this.bw*this.gameWidth+this.bs*(this.gameWidth-1);
    this.canvas.height=this.canvas.width;
    this.ctx=this.canvas.getContext("2d");
    this.render();
    this.update();
    this.generateFood();
}
Game.prototype.startGame = function(){
    this.start = true;
    this.snake = new Snake();
    $('.panel').hide();
    this.playSound("C#5",-20);    
    this.playSound("E5",-10,200);
}
Game.prototype.endGame = function(){
    this.start = false;
    $('h2').text("Score: "+((this.snake.body.length-5)*10));
    $('.panel').show();
    this.playSound("A3",-20);    
    this.playSound("E2",-10,200);
    this.playSound("A2",-10,400);

}
Game.prototype.getPosition = function(x,y){
    return new Vector(x*this.bw+x*this.bs,y*this.bw+y*this.bs)
}
Game.prototype.drawBlock = function(v,color){
    this.ctx.fillStyle = color;
    var pos = this.getPosition(v.x,v.y);
    this.ctx.beginPath()
    this.ctx.arc(pos.x+this.bw/2,pos.y+this.bw/2,this.bw/2,0,2*Math.PI);
    this.ctx.fill();
}
Game.prototype.drawEffect = function(x,y){
    var r=2;
    var pos =this.getPosition(x,y);
    var _this=this;
    var effect =function(){
        r++;
        _this.ctx.strokeStyle="rgba(255,0,0,"+(100-r)/100+")";
        _this.ctx.beginPath();
        _this.ctx.arc(pos.x+_this.bw/2,pos.y+_this.bw/2,r,0,Math.PI*2);
        _this.ctx.stroke();
        if(r<100){
            requestAnimationFrame(effect)
        }
    }
    requestAnimationFrame(effect);
}
Game.prototype.render=function(){
    this.ctx.fillStyle ="rgba(0,0,0,0.3)";
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    for(var x=0;x<this.gameWidth;x++){
        for(var y=0;y<this.gameWidth;y++){
            this.drawBlock(new Vector(x,y),'rgba(255,255,255,0.03)')            
        }
    }
    this.snake.body.forEach((sp,i)=>{
        this.drawBlock(sp,"white");
    })
    this.foods.forEach((p)=>{
        this.drawBlock(p,"red");
    })
    requestAnimationFrame(()=>{this.render()})
}
Game.prototype.generateFood = function(){
    var x = parseInt(Math.random()*this.gameWidth);
    var y = parseInt(Math.random()*this.gameWidth);  
    while (this.snake.body.some(pos =>( pos.x==x && pos.y==y )))
    {
        x = parseInt(Math.random()*this.gameWidth);
        y = parseInt(Math.random()*this.gameWidth);
    }
    
    this.foods.push(new Vector(x,y));   
    this.drawEffect(x,y)
    this.playSound("E5",-20);
    this.playSound("A5",-20,50);


}
Game.prototype.update=function(){
    if (this.start){
        this.playSound("A2",-30);
        this.snake.update();
        this.foods.forEach((food,i)=>{
            if(this.snake.head.equal(food)){
                this.snake.maxLength++;
                this.foods.splice(i,1);
                this.generateFood();
                this.generateFood();
                this.generateFood();
            }
        
        this.snake.body.forEach(bp=>{
            if(this.snake.head.equal(bp)){
                this.endGame();
            }
        })
        if(this.snake.checkBoundary(this.gameWidth)==false)
        {
            this.endGame();
        }
    })
    }
    setTimeout(()=>{
        this.update();
    },50)
}
Game.prototype.playSound=function(note,volume,when){
    setTimeout(function(){
        var synth = new Tone.Synth().toMaster();
        synth.volum = volume || -12;
        synth.triggerAttackRelease(note,"8n");
    },when || 0)
}
var game = new Game();
game.init();
$(window).keydown(function(evt){
    game.snake.setdirection(evt.key.replace("Arrow",''))
})