const food = {
    init:function(type){
        this.type = type;
    },
    eat: function(){
        console.log("you ate the "+ this.type);
    }
}

food.init("waffle");
food.eat();


