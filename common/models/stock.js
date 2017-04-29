'use strict';
//var app = require();
//var response = undefined;

module.exports = function(Stock){
function CnFind(cn,cb){
  console.log(cn);
  Stock.find({where: { Company_Name : cn } },function(err,documents){
    if(err) cb(err)
    console.log(documents.length);
    cb(null,documents.length);

    //console.log('I got the results in Stocks');
  })
}

module.exports.CnFind= CnFind;
}
