if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); 
const cors = require('cors');  
const path = require('path');   
const { v4: uuidv4 } = require('uuid');
 
const app = express();

const PORT = process.env.PORT || 3500;

app.use(cors({}));
  
app.use(express.static(path.join(__dirname, 'Public')));

app.use(bodyParser.json());


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,         
  password: process.env.DB_PASSWORD,           
  database: process.env.DB_NAME   
});


// Connect to DB
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.post('/students', (req, res) => {
  const { name, email } = req.body;
  const uid = uuidv4();

  const sql = 'INSERT INTO students (uid, name, email) VALUES (?, ?, ?)';
  db.query(sql, [uid, name, email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Student added', id: result.insertId, uid });
  });
});


// Get all students
app.get('/students', (req, res) => {
    const uid = uuidv4(); 
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});



// Get a student by UID
app.get('/students/:uid', (req, res) => {
  const sql = 'SELECT * FROM students WHERE uid = ?';
  db.query(sql, [req.params.uid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(results[0]);
  });
});



// Update a student by UID
app.put('/students/:uid', (req, res) => {
  const { name, email } = req.body;
  const sql = 'UPDATE students SET name = ?, email = ? WHERE uid = ?';
  db.query(sql, [name, email, req.params.uid], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated' });
  });
});


// Delete a student by UID
app.delete('/students/:uid', (req, res) => {
  const sql = 'DELETE FROM students WHERE uid = ?';
  db.query(sql, [req.params.uid], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted' });
  });
});



// const PORT = 3500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});




















// Add a new student
// app.post('/students',(req, res) => {
//   const { name, email } = req.body;
 
//   const sql = 'INSERT INTO students (name, email) VALUES (?, ?)';
//   db.query(sql, [name, email], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.status(201).json({ message: 'Student added', id: result.insertId });
//   });
// });


// Update a student
// app.put('/students/', (req, res) => {
//   const { name, email } = req.body;
//   const sql = 'UPDATE students SET name = ?, email = ? WHERE id = ?';
//   db.query(sql, [name, email, req.params.id], (err) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Student updated' });
//   });
// });



// Delete a student
// app.delete('/students/', (req, res) => {
//   const sql = 'DELETE FROM students WHERE id = ?';
//   db.query(sql, [req.params.id], (err) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Student deleted' });
//   });
// });




// Get a student by ID
// app.get('/students/:id', (req, res) => {
//   const sql = 'SELECT * FROM students WHERE id = ?';
//   db.query(sql, [req.params.id], (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
//     res.json(results[0]);
//   });
// });