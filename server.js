const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const e = require("express");
const hbs = require('nodemailer-express-handlebars');



app.use(express.static(__dirname + "./views/pages/style/style.css"));

const getData = async () => {
  const data = await axios
    .get("https://api.clickup.com/api/v2/list/199458494/task", {
      headers: {
        Authorization: "61204341_4a56da8bbb100dc59dba68e07427682fce205db9",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err);
      return;
    });
  return data?.tasks || [];
};


app.set("view engine", "ejs");
app.use(express.static("./views/pages"));
app.get("/", async function (req, res) {
  const html = await createTemplate();
  res.write(html);
  res.send();
});

app.get("/data", async function (req, res) { });

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});



// build your template
const createTemplate = async () => {
  // Load the EJS file
  const template = fs.readFileSync("./views/pages/Home.ejs", "utf-8");
  const urgentTask = [];
  const highTask = [];
  const normalTask = [];
  const lowTask = [];
  const nullTask = [];
  const tasks =  await getData();

  for (let index=0; index < tasks.length || 0 ; index++) {
    if(tasks[index]?.priority?.priority == "urgent") {
      urgentTask.push(tasks[index]);
    }
  }

  for (let index=0; index < tasks.length || 0; index++) {
    if(tasks[index]?.priority?.priority == "high") {
      highTask.push(tasks[index]);
    }
  }
  for (let index=0; index < tasks.length || 0; index++) {
    if(tasks[index]?.priority?.priority == "normal") {
      normalTask.push(tasks[index]);
    }
  }
  for (let index=0; index < tasks.length || 0; index++) {
    if(tasks[index]?.priority?.priority == "low") {
      lowTask.push(tasks[index]);
    }
  }

  for (let index=0; index < tasks.length || 0; index++) {
    if(tasks[index].priority === null) {
      nullTask.push(tasks[index]);
    }
  }
  
  

  const html = ejs.render(template, { tasks:tasks, urgentTask:urgentTask, highTask:highTask, normalTask:normalTask, lowTask:lowTask, nullTask:nullTask });
  return html;
};


(async (req, res) => {
// launch a new chrome instance
const browser = await puppeteer.launch({
  headless: true
});

// create a new page
const page = await browser.newPage()

// Go to URL of HTML that I want to export in PDF
await page.goto(`http://localhost:3000/`, {
    waitUntil: "networkidle0"
});

// Create pdf file of opened page
const pdf = await page.pdf({
 printBackground: true,
 format: 'A4',
 path: `${path.resolve("ClickUp.pdf")}`,
 landscape: true,
 margin:{
    top:"10px",
    bottom:"10px",
    left:"20px",
    right:"20px",
 }
});

// close the browser    
// await browser.close();

// Return generated pdf in response

}) ();


// //sentmail function for sending mails directly whenever pdf generated 

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhinabsarkar07@gmail.com',
    pass: 'mkkbenjnklixrtkv'
  }
});


var mailOptions = {
  from: 'abhinabsarkar07@gmail.com',
  to: "dj@trustedcommunities.org",
  subject: 'Sending Email with attached ClickUp file below',
  body: 'This mail is regarding ClickUp Tasks',
  attachments: [
          {
              filename: "ClickUp.pdf",
              path: path.resolve(__dirname, 'ClickUp.pdf'),
             contentType: "application/pdf", // <- You also can specify type of the document
           },
         ],
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});




