
const express = require('express')
const bodyParser = require('body-parser');
const mysql2 = require("mysql2");
let ejs = require('ejs');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


var dbConn = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "BH"
})



//home page
app.get('/', (req, res) => {
  res.render('home');
})


//retrieve data from the database
app.get('/show', (req, res) => {
  let sel_query = `SELECT BH.studentMaster.*,BH.collageMaster.collageName as clg FROM BH.studentMaster LEFT JOIN BH.collageMaster ON BH.studentMaster.collageId = BH.collageMaster.id `;
let limit = req.query.limit || 10
  if (req.query.page > 1) 
    sel_query += ` LIMIT ${((req.query.page - 1)*limit)}, ${limit}`;
  else
  sel_query += ` LIMIT ${limit} `;
  console.log(limit);
  

  dbConn.query(sel_query, (error, results) => {
    if (error) throw error;

    dbConn.query(`SELECT count(*) as 'cnt' FROM BH.studentMaster LEFT JOIN BH.collageMaster ON BH.studentMaster.collageId = BH.collageMaster.id `, (eee, countedRecords) =>{
      if (eee) throw eee;
      
      res.render('show', { students: results , page: req.query.page, total: countedRecords[0].cnt, limit : req.query.limit});
    })
  });

})
app.post('/show', (req, res) => {
  if (req.body.search == "") {
    res.redirect('/show');
  }
  else {

    dbConn.query("SELECT s.*,c.collageName as clg FROM BH.studentMaster as s LEFT JOIN BH.collageMaster as c ON s.collageId=c.id WHERE s.id like" + " '%" + req.body.search + "%'" + " OR s.firstName " + " like '%" + req.body.search + "%'" + " OR s.lastName " + " like '%" + req.body.search + "%'" + " OR s.emailId " + " like '%" + req.body.search + "%'" + " OR s.contactNumber " + " like '%" + req.body.search + "%'" + " OR s.city " + " like '%" + req.body.search + "%'" + " OR c.collageName " + " like '%" + req.body.search + "%'"
      , (error, results) => {
        if (error) throw error;

        // console.log(results);
        res.render('show', { students: results ,limit:10, page:1, total: results.length});
      });
  }
})

//user id 
app.get('/user/:id', (req, res) => {
  dbConn.query('SELECT BH.studentMaster.*,BH.collageMaster.collageName as clg FROM BH.studentMaster LEFT JOIN BH.collageMaster ON BH.studentMaster.collageId = BH.collageMaster.id WHERE BH.studentMaster.id=? LIMIT 10 ', [req.params.id], (error, results) => {
    if (error) throw error;

    res.render('user', { students: results });
  });
})


//Add the data(insert) to the database
app.get('/add', (req, res) => {
  res.render('add');
})
app.post('/addPost', (req, res) => {
  dbConn.query('INSERT INTO studentMaster SET?', req.body, (error, results) => {
    if (error) throw error;
    res.render('done', { msg: "Inserted successfully" });
  });
})


//delete
app.get('/delete/:id', (req, res) => {
  dbConn.query('DELETE FROM studentMaster WHERE id =?', [req.params.id], (error, results) => {
    if (error) throw error;

    res.render('done', { msg: "Deleted successfully" });
  });
})

//insert 1500 records random using api
const randomNum = (n) => Math.floor(Math.random() * n) + 1; //from 1
const randomNumBet = (min, max) => Math.floor(Math.random() * (max - min) + min); //from 1

const random_name = require("random-indian-name");
const cities = require('cities');
const randomEmail = require('random-email');
const { query } = require('express');

let collageNames = [
  "Chimanbhai MU Patel Industrial Training Centre, Vallabh Vidyanagar",
  "Vadodara Design Academy School Of Architecture, Vadodara",
  "G H Patel Department of computer Science and Technology, Vallabh vidhyanagar",
  "Babaria Institute Of Technology, Varnama",
  "Vanvasi Seva Samaj BEd College, Pavi Jetpur",
  "Sheth M N C College Of Education, Dabhoi",
  "Shri Janki Vallabh Arts And Shri MS Patel Commerce College, Muval ",
  "Kapadia N M M S Arts & The S N S B Commerce College, Sankheda",
  "Babaria Institute Of Technology BIT, Vadodara",
  "Gujarat Flying Club, Vadodara",
  "Shree Mahalaxmi Mahila Homeopathic Medical College, Vadodara",
  "Indian Institute of Information Technology (IIIT), Vadodara",
  "Parul Institute of Engineering & Technology, Limda",
  "Unitedworld Institute of Design (UID), Ahmedabad",
  "Som Lalit Institute Of Business Administration SLIBA, Ahmedabad",
  "Som Lalit College Of Commerce SLCC, Ahmedabad",
  "Silver Oak College Of Engineering & Technology SOCET, Ahmedabad",
  "Physical Research Laboratory, Navrangpura",
  "R B Institute Of Management Studies, Naroda",
  "B M Institute Of Mental Health, Ahmedabad",
  "L M College Of Pharmacy, Navrangpura",
  "Sheth M.C. College of Dairy Science, Anand",
  "Ipcowala Santram College Of Fine Arts, Anand",
  "Nalini Arvind & TV Patel Arts College, Anand",
  "AR College Of Pharmacy & GH Patel Institute Of Pharmacy, Vallabh Vidyanagar",
  "Birla Vishvakarma Mahavidyalaya BVM, Anand",
  "PD Patel Institute Of Applied Sciences PDPIAS, Anand",
  "Indukaka Ipcowala College Of Pharmacy, Anand",
  "College Of Agricultural Information Technology, Anand",
  "Shantilal Shah Engineering College, Bhavnagar",
  "Swami Vivekanand Homeopathic Medical College, Bhavnagar",
  "Govt Medical College, Bhavnagar",
  "Shri Samanvay Institute Of Pharmacy, Botad",
  "Shree Sahajanand Institute of Management, Bhavnagar",
  "Smt PNR Shah Mahila Arts & Commerce College, Palitana",
  "Shri Gulabrai H Sanghvi Shikshan Mahavidyalaya, Bhavnagar",
  "JC Kumarappa Mahavidyalaya, Gadhada",
  "Samaldas Arts College, Bhavnagar",
  "School Of Physiotherapy, Rajkot",
  "Shree BA Dangar Homeopathic Medical College, Rajkot",
  "Indubhai Parekh School Of Architecture, Rajkot",
  "BK Mody Government Pharmacy College, Rajkot",
  "Shree HN Shukla Institute of Pharmaceutical Education and Research, Rajkot",
  "Christ College, Rajkot",
  "Shri K K Sheth Physiotherapy College, Rajkot",
  "J S Ayurved Mahavidyalaya, Nadiad ",
  "U T S Mahila Arts College, Nadiad",
  "Ayurveda Samsthanam, Nadiad",
  "Sabar Institute Of Technology For Girls, Sabarkantha",
  "Grow More Faculty of Computer Application (MCA), Himmatnagar"
]

//insert 1500 records into BH.student_express table
app.get('/insert-1500', (req, res) => {
  for (let i = 1; i <= 1500; i++) {
    dbConn.query(
      `INSERT INTO BH.student_express(first_name,last_name,city,email,phone_number,collage_name) VALUES("${random_name({ first: true })}","${random_name({ last: true })}","${cities.findByState('IN')[randomNum(750)].city}","${randomEmail({ domain: 'gmail.com' })}","${randomNumBet(6300000000, 9700000000)}","${collageNames[randomNum(50)]}");`
      , (error, results) => {
        if (error) throw error;

      });
  }
  res.render('done', { msg: '1500 records inserted' });
});


app.listen(3001, () => {
  console.log(`Server is running on port 3001`)
})
