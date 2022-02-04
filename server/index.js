//Libraries
const express = require('express');
const multer  = require('multer');
const {body, checkSchema, validationResult, check} = require('express-validator');
const path = require('path');
const fs = require('fs');
const {request, response} = require("express");


//Setup defaults for script
const port = 3000 //Default port to http server
const app = express();
const storage = multer.diskStorage({
    // logic where to upload file
    destination: function (request, file, callback) {
        callback(null, 'uploads/');
    },
    // logic to name the file when uploaded
    filename: function (request, file, callback) {
        callback(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    // validation for file upload
    fileFilter: (request, file, callback) => {
        const allowedFileMimeTypes = ['text/javascript'];
        callback(null, allowedFileMimeTypes.includes(file.mimetype));
    }
});


//The * in app.* needs to match the method type of the request
app.post(
    '/',
    upload.single('hello-world-upload'),
    // dropdowns allow custom input so can't use isIn()
    body('name', 'Please enter a valid name').isAlpha().isLength({min: 1, max:32}).trim().escape(),
    body('email', 'Please enter a valid email').isEmail().trim().escape(),
    body('languages-used', 'Please enter a valid programming language').isLength({min: 1}).trim().escape(),
    body('favorite-language', 'Please enter your favorite programming language').isLength({min:1, max:24}).trim().escape(),
    body('why-favorite', 'Please explain in less than 300 characters why it is your favorite').isLength({min: 1, max: 300}).trim().escape(),
    body('programming-types', 'Please enter what types of programming you typically do').isLength({min: 1}).trim().escape(),
    body('visual-coding-thoughts', 'Please explain your thoughts on visual coding in less than 300 characters').isLength({min: 1, max:300}).trim().escape(),
    checkSchema({
        'hello-world-upload': {
            custom: {
                options: (value, {req}) => !!req.file,
                errorMessage: 'Please upload a javascript file that logs hello world to the console',
            },
        },
    }),
    (request, response) => {
        console.log(request.file);       //request.files is the files uploaded with the request
        console.log(request.body); //request.body is only non-file data from the request

        // validate request; if there are any errors, send 400 response back
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response
                .status(400)
                .setHeader('Access-Control-Allow-Origin', '*')
                .json({
                    message: 'Request fields or files are invalid',
                    errors: errors.array(),
                })
        }


        // get json file for storing submissions
        let submissionsData = fs.readFileSync("submissions.json", {encoding: 'utf-8'});
        let submissions = JSON.parse(submissionsData);
        let newSubmission = request.body;
        newSubmission['file-name'] = request.file.originalname;

        submissions['submissions'].push(newSubmission);

        fs.writeFile('submissions.json', JSON.stringify(submissions), err => {
            if (err) throw err;

            console.log('data written to file');
        })

        response
            .setHeader('Access-Control-Allow-Origin', '*') //Prevent CORS error
            .json(submissions);
    });

app.post('/submissions', (request, response) =>{
    let submissionsData = fs.readFileSync("submissions.json", {encoding: 'utf-8'});
    let submissions = JSON.parse(submissionsData);

    response
        .setHeader('Access-Control-Allow-Origin', '*') //Prevent CORS error
        .json(submissions);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})