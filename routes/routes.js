const express = require('express'); 
const router = express.Router();

const User = require('../models/users');
const multer = require('multer'); 



//image upload
var storage = multer.diskStorage({
    destination :function(req , file , cb){
        cb(null , './uploads')
    },
    filename : function(req , file , cb){
        cb(null , file.fieldname+"_"+Date.now()+"_"+file.originalname); 
    }
}); 


var upload = multer({
    storage : storage ,
}).single("image"); 



// Route to add a new user
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save(); // Saving the user asynchronously using await

        req.session.message = {
            type: 'success',
            message: 'User added Successfully'
        };
        res.redirect('/');
    } catch (err) {
        // Handle error
        res.json({ message: err.message, type: 'danger' });
    }
});






//get all users Route 
router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index.ejs', {
            title: 'Home Page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});



router.get('/add' , (req,res)=>{
    res.render('add_users' , {title : "add users"})
});



module.exports = router; 