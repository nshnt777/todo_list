import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import _ from 'lodash';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const date = new Date();
const day = date.getDate();
const month = date.getMonth()+1;
const year = date.getFullYear();
const fullDate = day + "." + month + "." + year;

// Database
async function main(){
    await mongoose.connect("mongodb+srv://admin-nishant:Test123@cluster0.qehavwd.mongodb.net/todoListDB")
    .then(() => {
        console.log("Connected to database");
    }).catch((err) => {
        console.log(err);
    });
}

main();

const itemsSchema = new mongoose.Schema({
    task: String
});

const Task = mongoose.model("Task", itemsSchema);

const task1 = new Task({
    task: "Welcome to your today's todo list"
});
const task2 = new Task({
    task: "Hit the + button to add a task"
});
const task3 = new Task({
    task: "<-- Hit this button to delete a task"
});

const newTaskList = [task1, task2, task3];




// Server
app.get('/', (req,res)=>{
    res.render('index.ejs');
});

// FOR TODAY
app.get("/today", async(req,res)=>{

    try{
        const tasks = await Task.find({});
        if(tasks == 0){
            Task.insertMany(newTaskList)
            .then((result) => {
                console.log("Tasks inserted to database");
            }).catch((err) => {
                console.log(err);
            });
            res.redirect("/today");
        }
        else{
            res.render("today.ejs", {today: true, date: fullDate, newTask: tasks});
        }
    }
    catch(err){
        console.log(err);
    }
});




//FOR CUSTOM LISTS
const customListSchema = new mongoose.Schema({
    name: String,
    tasks: [itemsSchema]
});

const customList = mongoose.model("List", customListSchema);

const cusTask1 = new Task({
    task: "This"
});
const cusTask2 = new Task({
    task: "Is a Custom Task List"
});
const cusTask3 = new Task({
    task: "Created by you"
});

const cusTaskList = [cusTask1, cusTask2, cusTask3];

app.get("/:customListName", async(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);

    try {
        const foundList = await customList.findOne({name: customListName});
        if(!foundList){
            const customListItem = new customList({
                name: customListName,
                tasks: cusTaskList
            });
            
            await customListItem.save();
            res.redirect("/"+customListName);
        }else{
            res.render("list.ejs", {work:true, date:fullDate, listTitle: foundList.name, newTask: foundList.tasks});
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/today", async(req,res)=>{
    const item = req.body["NewTask"];
    const postListName = req.body["postListName"];

    const taskToAdd = new Task({
        task: item
    });

    try{
        if(postListName == "Today"){
            await taskToAdd.save();
            console.log("Successfully added task");
            res.redirect("/today");
        }
        else{
            const foundList = await customList.findOne({name: postListName});
            foundList.tasks.push(taskToAdd);
            await foundList.save();
            res.redirect("/"+postListName);
        }
    }
    catch(err){
        console.log(err);
    }
});

app.post("/delete", async(req,res)=>{
    const checkedItemID = req.body["deleteTask"];
    const listName = req.body["listName"];
    console.log(listName);
    try {
        if(listName == "Today"){
            await Task.deleteOne({_id: checkedItemID});
            console.log("Successfully deleted task");
            res.redirect("/today");
        }
        else{
            await customList.updateOne({name: listName}, {$pull: {tasks: {_id: checkedItemID}}});
            res.redirect("/"+listName);
        }
    } 
    catch (err) {
        console.log(err);
    }
});


app.listen(port, ()=>{
    console.log('Listening at port http://localhost:'+port);
});
