const express = require('express');
const router = express.Router();
const psychModel = require('../Models/psychModel');
router.post('/joinPsych/:roomID', (req ,res)=>{
    psychModel.findOneAndUpdate({roomID:req.params.roomID},{"$push":{users: req.body}},{new:true}, (err, room)=>{
        if(err){
            console.error(err);
            return res.json({code:500, errCode:500, message:"Internal Server Error"});
        }
        else{
            res.json({code:200, errCode:null, room});
        }
    });  
});


module.exports = router; 