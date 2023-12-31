const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const {check, validationResult} = require('express-validator')
const User = require('../../models/User');


//@route   POST api/users
//@desc    Register User
//@access  Public
router.post('/', 

//start validation
[check('name', 'Name is required').not().isEmpty(), 
 check('email', 'Please enter a valid email').isEmail(),
 check('password', 'Please enter a password with 6 or more characters').isLength({min:6})],
//end validation
 async (req, res) => {

    //Access validation result 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    //End Access to validation result

     //Destructure the request body
     const {name, email, password} = req.body;
    
     try{
    //check if uer exists
     let user = await User.findOne({email});
     if(user){
        return  res.status(400)
              .json({errors: [{msg:'User already exists'}]})
     }
     //get user gravatar
      const avatar = gravatar.url(email, {
        s:'200',
        r:'pg',
        d:'mm'
      })
      
      user = new User ({
        name,
        email,
        avatar,
        password
      });

    //Encrypt password
     const salt = await bcrypt.genSalt(10);

     user.password = await bcrypt.hash(password,salt);
 
     await user.save()
    //Return jsonwebtoken

    const payload = {
        user:{
            id: user.id
        }
    }

    jwt.sign(
        payload,
         config.get('jwtSecret'),
         { expiresIn:36000 },
         (err, token) => {
          if(err) throw err;
          res.json({token});
         });
   
}catch(err){
    console.error(err.message)
    res.status(500).send('Server error')
}

   
});

module.exports = router;