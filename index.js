import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

const date = new Date();
const fullDate = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get('/', (req,res)=>{
    res.render('index.ejs');
});

let newTaskList = [];
app.get("/today", (req,res)=>{
    res.render("today.ejs", {today: true, date: fullDate, newTask: newTaskList});
});

app.post("/today", (req,res)=>{
    let item = req.body["NewTask"];
    newTaskList.push(item);
    res.redirect("/today");
});

let newWorkList = [];
app.get("/work", (req,res)=>{
    res.render("work.ejs", {work: true, date: fullDate, newTask: newWorkList});
});

app.post("/work", (req,res)=>{
    let item = req.body["NewTask"];
    newWorkList.push(item);
    res.redirect("/work");
});

app.listen(port, ()=>{
    console.log('Listening at port http://localhost:'+port);
});
