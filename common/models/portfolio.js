'use strict';
var Stock = require('./stock');
var _=require('lodash');
var mongo = require('mongodb').MongoClient;

module.exports = function(Portfolio){

  Portfolio.addTrade= function(data,cb){
    var cn = data.Company_Name;
    Stock.CnFind(cn,function(error,res){
      if(error){
        console.log(error);
      }
      else if (res === 0) {
        var response = "There is no such Company_Name in Stock";
        cb(null,response);
      }
      else if(res === 1){
        data.Type = data.Type.toUpperCase();
        if(data.Type === 'SELL'){
          data.Quantity = -1*data.Quantity;
        }
        console.log(data);
        Portfolio.create(data,function(error,results){
          if(error){
            console.log('error',error);
            cb(error);
          }
          response = 'Your data has been added to your Portfolio';
          cb(null,response);
        });
      }

    })}


  Portfolio.Holdings = function(data, cb){
    var Quant= undefined;
    var Price_Avg = undefined;
     mongo.connect('mongodb://localhost:27017/Portfolio_API',function(err,db){
      if(err) console.log(err);
      var portfolio = db.collection('portfolio');
      portfolio.aggregate([
      
      {
          $match: {Type:"BUY"}
      },
      {
            $group :{
              _id:"$Company_Name",
              Avg_Price :{$avg:"$Price"}
              },
      }
      ],function(err,data){
        if(err) console.log(err);
        Quant= data;
        console.log(Quant);
        portfolio.aggregate([
          {
        $group: {
          _id:"$Company_Name",
          Quantity_remaining:{$sum: '$Quantity'}
        }
      }],function(err,data1){
          if(err) console.log(err);
          Price_Avg=data1;
          console.log(Price_Avg);
          var finalResponse = [];
          _.forEach(Quant,function(obj1){
            var temp = _.filter(Price_Avg,function(obj2){
              return obj2._id === obj1._id;
            });
            var Result = {};
            Result.Company_Name= obj1._id;
            Result.AvgPrice=obj1.Avg_Price;
            Result.Quantity=temp[0].Quantity_remaining;
            finalResponse.push(Result);
          })
          console.log("finalResponse=", finalResponse);
          //finalResponse = _.flattenDeep(finalResponse);
          //console.log(finalResponse);
          db.close();
          return cb(null,finalResponse);
          
        })
        
      })

    })
   }
  
  Portfolio.deleteTrade = function(data,cb){
    console.log("inside deleteTrade data=", data);
    Portfolio.find({
      where:{
        Company_Name : data.Company_Name,
           Type : data.Type,
           Date : data.Date,
           Quantity : data.Quantity,
           Price: data.Price}
    }, function(err, res){
      if(err) console.log(err);
      console.log(res[0].id);
      mongo.connect('mongodb://localhost:27017/Portfolio_API',function(err,db){
        if(err) console.log(err);
        var portfolio = db.collection('portfolio');
        portfolio.deleteOne({ "_id" : res[0].id },function(err,result){
          if(err) console.log(err);
        })

     })
    })}
    
  

  Portfolio.remoteMethod('deleteTrade',{
    description: "deleteTrade",
    accepts:{
            arg:"data",
            type:'object',
            require:'true',
            http:{
              source:'body'
           }
         },
    returns:
    {
      arg:"results",
      type:'number',
    },
    http:{
      path: '/deleteTrade',
      verb: 'post'
    }}) 



  Portfolio.remoteMethod('Holdings',{
    description: "Holdings",
    accepts:{
            arg:"data",
            type:'object',
            require:'true',
            http:{
              source:'body'
           }
         },
    returns:
    {
      arg:"results",
      type:'number',
    },
    http:{
      path: '/Holdings',
      verb: 'get'
    }})


  Portfolio.remoteMethod('addTrade',{
    description: "Add Trades to your Portfolio",
    accepts:{
            arg:"data",
            type:'object',
            require:'true',
            http:{
              source:'body'
           }
         },
    returns:
    {
      arg:"response",
      type:'string',
    },
    http:{
      path: '/addTrade',
      verb: 'post'
    }})

}


