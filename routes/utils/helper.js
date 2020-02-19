const  { validationResult } = require('express-validator');
const errorsCheck = (req) => {
    const errors  = validationResult(req);
    let message = "";
      if(!errors.isEmpty()){
          errors.errors.map(element => {
            if(element === errors.errors[errors.errors.length -1])
            message += element.msg;
            else
            message += element.msg + ', ';
          })
         return { msg: message, type : true};
      }
      return { type: false};
  }
  module.exports = {
      errorsCheck
  }