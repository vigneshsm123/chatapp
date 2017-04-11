var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';

module.exports = function(router){
    router.post('/authenticate',function(req,res){
        User.findOne({email:req.body.email}).select('email password').exec(function(err,user){
            if(err) throw err;
            if(!user)
                res.json({"txStatus":"failure","message":"User does not exists","alert":"danger"});
            else if(user){
                var validPassword = user.comparePassword(req.body.password);
                if(validPassword){
                    var token = jwt.sign({email:user.email},secret,{expiresIn:'24h'});
                    res.json({"txStatus":"success","message":"Authentication successful","alert":"success","token":token});

                }
                else
                    res.json({"txStatus":"failure","message":"Password does not match","alert":"danger"});
            }

        })
    })
    router.post('/users',function (req, res){
        var user = new User();
        user.email  = req.body.email;
        user.password  = req.body.password;
        var CRITERIA =  checkValid(req.body.password) && checkValid(req.body.email); 
        if(!CRITERIA){
            res.send({"message":"Ensure you have entered username, password,email","txStatus":"failure","alert":"danger"});
        }
        else{
            user.save(function(err){
                if(err)
                    res.send({"message":"User ID already exists","txStatus":"failure","alert":"danger"});
                else
                    res.send({"message":"User created successfully","txStatus":"success","alert":"success"});
            });
        }
    });
    router.use(function(req, res, next){
       var token =  req.body.token || req.body.query || req.headers['x-access-token']
       if(token){
           //verify token
           jwt.verify(token,secret,function(err,decoded){
               if(err) {
                   res.json({"txStatus":"failure","message":"Token Invalid"})
               }else{
                   req.decoded = decoded;
                   next();
               }
           })
       } 
       else{
           res.json({"txStatus":"failure","message":"No token provided"})
       }
    });
    router.post('/me',function(req,res){
        res.send(req.decoded);
    });
    return router;
}
function checkValid(elem){
    if(typeof(elem)=='undefined' || elem=='' || elem ==null )
        return false;
    return true;
}