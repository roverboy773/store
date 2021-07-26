const menu=require('../../models/menu')
const mongoose=require('mongoose');

function homeController(){
    return {
        async index(req,res){
           // const all=await menu.find().updateMany({image:'pizza.jpg'},{$set:{image:"pizza.png"}})
           const pizzas= await menu.find({category:"phone"});
        
        //    console.log(pizzas)
           res.render('home',{Menu:{pizzas}});
        }
    }
}

module.exports=homeController;

// 3O2itB7jOIE63jt9