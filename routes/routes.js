const express = require('express'); 
const router = express.Router();

const User = require('../models/users');
const multer = require('multer'); 
const fs = require('fs'); 
const { getDefaultResultOrder } = require('dns');



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




// Edit an User ROUTE 
router.get('/edit/:id', async (req,res)=>{
    const id = req.params.id ;
    try{
        const user = await User.findById(id); 
        if(user == null){
            res.redirect('/');
        }
        else{
            res.render('edit_users.ejs', {
                title : "Edit user",
                user : user ,
            })
        }

    }catch(err){
        res.redirect('/'); 
    }

}); 



//update user info route 
router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let new_image = "";

    try {
        if (req.file) {
            new_image = req.file.filename;
            await fs.unlinkSync('./uploads/' + req.body.old_image);
        } else {
            new_image = req.body.old_image;
        }

        const updatedUser = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (!updatedUser) {
            throw new Error("User not found");
        }

        req.session.message = {
            type: 'success',
            message: "updated",
        };
        res.redirect('/');
    } catch (error) {
        res.json({ message: error.message, type: 'danger' });
    }
});


//delete a user with his pic 
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        if (user.image !== '') {
            await fs.unlinkSync('./uploads/' + user.image); // Corrected path
        }

        await User.findByIdAndDelete(id);

        req.session.message = {
            type: "info",
            message: "deleted"
        };

        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });
    }
});




router.get('/add' , (req,res)=>{
    res.render('add_users' , {title : "add users"})
});



module.exports = router; 