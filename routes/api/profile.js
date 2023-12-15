const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check, validationResult} = require('express-validator')

/***********************************************************************888
GET CURRENT USERS PROFILE
****************************************************************************** */

//@route   GET api/profile/me
//@desc    Get current users profile
//@access  Private


router.get('/me',auth, async (req, res) =>
{
      try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar'])
        
        if(!profile){
            return res.status(401).json({
                msg: 'No Such Profile for this user'
            })
        }

        res.json(profile)
    } 
      catch (err) {
        console.error(err.message)
        res.status(500).send(`Server Error`)
      }
});

/***********************************************************************
 Create or update a users profile
 /**********************************************************************/
//@route   POST api/profile
//@desc    Create or update a users profile
//@access  Private
 
router.post('/', [
    auth,
    [
        check('status', 'Status is required')
        .not().isEmpty(),
        check('skills', 'Skills is required')
        .not().isEmpty()
    ]
], 
async (req, res) =>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
 
       
     const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
     } = req.body;

     //Build Profile Object

     const profileFields = {};
     profileFields.user = req.user.id;
     if(company)profileFields.company = company;
     if(website)profileFields.website = website;
     if(location)profileFields.location = location;
     if(bio)profileFields.bio = bio;
     if(status)profileFields.status = status;
     if(githubusername)profileFields.githubusername = githubusername;

    if(skills)profileFields.skills = skills.split(',').map(skill =>skill.trim())


    // Builld social
     profileFields.social = {};
    if(youtube)profileFields.social.youtube = youtube;
    if(twitter)profileFields.social.twitter = twitter;
    if(facebook)profileFields.facebook = facebook;
    if(linkedin)profileFields.linkedin = linkedin;
    if(instagram)profileFields.instagram = instagram;
     

      try{
        //findUser
        let profile =await Profile.findOne({user:req.user.id})
        
        //update profile
        if(profile){
        
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
            );
            return res.json(profile);
        }

        //create profile
         profile = new Profile(profileFields);
         await profile.save();
         return res.json(profile);
    }
      catch(err){

        console.error(err.message);
        res.status(500).send("Server Error")
      }
    });
/***********************************************************************
 GET ALL PROFILES
 /**********************************************************************/
//@route   get api/profile
//@desc    Get all profiles
//@access  Public 

router.get('/', async(req, res) =>{
    try {
    const profiles = await Profile.find().populate('user', ['name','avatar'])
    res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

/***********************************************************************
 GET ALL PROFILE BY USER ID
 /**********************************************************************/
//@route   get api/profile/user/:user_id
//@desc    Get profile by user ID
//@access  Public

router.get('/user/:user_id', async(req, res) =>{
    try {
    const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name','avatar'])
     if(!profile) return res.status(400).json({msg : 'There is no profile for this user'})
    res.json(profile)
    } catch (err) {
        console.error(err.message)
        if(err.kind == 'ObjectId'){
          return  res.status(400).json({msg : 'Profile Not Found'})
        }
        res.status(500).send('Server Error')
    }
})



/***********************************************************************
 DELETE PROFILE USER AND POST
 /**********************************************************************/
//@route   get api/profile/user/:user_id
//@desc    Delete profile, user and Post
//@access  private

router.delete('/', auth,async(req, res) =>{
    try {
        //@ -remove users post
        // Remove profile
     await Profile.findOneAndDelete({user: req.user.id});
 // Remove users
     await User.findOneAndDelete({ _id: req.user.id});
 
    res.json({msg: "User Deleted"})

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


/***********************************************************************
 PUT  ADD profile experience
 /**********************************************************************/
//@route   PUT api/profile/experience
//@desc    Add profile experience
//@access  private

router.put('/experience', [auth, [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),

]],async(req, res) =>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {title,company,location,from,to,current,description}

    try {
     
     const profile =  await Profile.findOne({user: req.user.id});
     profile.experience.unshift(newExp);
     profile.save();
     res.json(profile);
      
    
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});


/***********************************************************************
 DELETE   experience
 /**********************************************************************/
//@route   DELETE api/profile/experience/:exp_id
//@desc    delete profile experience
//@access  private

router.delete('/experience/:exp_id', auth, async (req, res) =>{
    try{
        const profile =  await Profile.findOne({user: req.user.id});
        //remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(
        req.params.exp_id);
        profile.experience.splice(removeIndex,1)
        await profile.save();
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});


/***********************************************************************
 PUT  ADD profile education
 /**********************************************************************/
//@route   PUT api/profile/education
//@desc    Add profile education
//@access  private

router.put('/education', [auth, [
    check('school', 'Title is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),

]],async(req, res) =>{

  const errors = validationResult(req);
  if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
  }
  const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
  } = req.body;

  const newEdu = { school,degree,fieldofstudy,from,to,current,description}

  try {
   
   const profile =  await Profile.findOne({user: req.user.id});
   profile.education.unshift(newEdu);
   profile.save();
   res.json(profile);
    
  
  } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
  }
});


/***********************************************************************
DELETE   education
/**********************************************************************/
//@route   DELETE api/profile/education/:edu_id
//@desc    delete profile education
//@access  private

router.delete('/education/:edu_id', auth, async (req, res) =>{
  try{
      const profile =  await Profile.findOne({user: req.user.id});
      //remove index
      const removeIndex = profile.education.map(item => item.id).indexOf(
      req.params.exp_id);
      profile.education.splice(removeIndex,1)
      await profile.save();
      res.json(profile)
  }catch(err){
      console.error(err.message)
      res.status(500).send('Server Error')
  }
});

module.exports = router;