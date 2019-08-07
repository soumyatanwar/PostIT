//use npm start
//to listen to requests received on server side, debugging with the help or morgan package, which is already installed
const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit')

const db = monk('localhost/meower'); // setup connection to the db called meower on the localhost
//(server is running locally on the machine) via monk (another popular package is mongoose) monk/mongoose
//basically help us to talk to the db

//mongo db is a document based db, it has collections and documents , basically like an arr which is 
// a collection of objects (in our case a tweet)
const mews = db.get('mews')//creates collection called mews inside db
const app = express();
const filter = Filter();

//The thing with middlewares - waterfall app.use() applies to all code below it?
app.use(cors()); // any request to be sent from client will be caught here before it is processed
app.use(express.json()) // to parse the body of any request of content type
//application/json received from client

app.get('/', (req, res) => {
    res.json({
        message: 'Meower'
    });
});

//any request to the server on the /mews route should query the db and display all the mews
app.get('/mews', (req, res) => {
    mews.find()
        .then(mews =>{
            res.json(mews)
        });
}) ;

//Whenever we submit the form that data has to be sent to the dynamic server, 
//so we need a route that is waiting for the data to be submitted so that it can 
//push it to the 

function isValidMew(mew){
    return mew.name && mew.name.toString().trim() !== '' &&
    mew.content && mew.content.toString().trim() !== ''   

}

//we only want to limit writes to the db
app.use(rateLimit({
    windowMs: 30*1000,// 30 sec (takes arg in milli seconds)
    max: 1
})) // 1 req in every 30 sec


//must validate the data to prevent blank writes to db
app.post('/mews', (req, res) => {
    console.log(req.body)
    if(isValidMew(req.body)){
        // insert into db
        const mew = {
            name : filter.clean(req.body.name.toString()), //prevents injection by type conversion to string
            content : filter.clean(req.body.content.toString()), //prevents bad-words through filtering
            created_date: new Date    
        } 
        //actually inserts mew into the collection
        mews
            .insert(mew) // insert it TODO: (insertOne/insertMany/bulkWrite because insert is deprecated)
            .then(createdMew => { // once it is inserted we respond with what was inserted
                res.json(createdMew);
            });

    }else{ 
        res.status(422);
        res.json({message:'Hey there! Name and content are required'})
    }
})

app.listen(5050, () => {
    console.log('Listening on http://localhost:5050');
});