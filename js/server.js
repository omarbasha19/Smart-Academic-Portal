const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

// Parse URL-encoded bodies for form data
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ae13200456*',
  database: 'student_portal'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to the MySQL database');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/viewstudents', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'viewstudents.html'));
});

app.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'log.html'));
});




app.get('/students', (req, res) => {
  const coursesQuery = 'SELECT course, exam_7th, exam_12th, classwork, final_exam, grade FROM student_course WHERE user_id = 10';
  const gpaQuery = 'SELECT GPA, C_GPA FROM gpa WHERE st_id = 10';

  db.query(coursesQuery, (err, courses) => {
    if (err) {
      return res.status(500).send(err);
    }

    db.query(gpaQuery, (err, gpaResults) => {
      if (err) {
        return res.status(500).send(err);
      }

      const gpa = gpaResults[0];
      res.json({ courses, gpa });
    });
  });
});

app.get('/studentsinfo', (req, res) => {
  const query = 'SELECT id, passcode, fname, lname, email, user_type, term FROM login WHERE id > 4';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.get('/allstudents', (req, res) => {
  const query = 'SELECT id, fname, lname, email FROM login WHERE id > 4';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post('/addstudent', (req, res) => {
  const { studentId, passcode, firstName, lastName, email, userType, term } = req.body;
  const query = 'INSERT INTO login (id, passcode, fname, lname, email, user_type, term) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [studentId, passcode, firstName, lastName, email, userType, term], (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).json({ message: 'Error adding student', error: err });
    }
    res.json({ message: 'Student added successfully', studentId });
  });
});

app.delete('/deletestudent/:id', (req, res) => {
  const { id } = req.params;

  const deleteGpaQuery = 'DELETE FROM gpa WHERE st_id = ?';
  db.query(deleteGpaQuery, [id], (err, result) => {
    if (err) {
      console.error('Error deleting GPA records:', err);
      return res.status(500).json({ message: 'Error deleting GPA records', error: err });
    }

    const deleteStudentCourseQuery = 'DELETE FROM student_course WHERE user_id = ?';
    db.query(deleteStudentCourseQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting student course records:', err);
        return res.status(500).json({ message: 'Error deleting student course records', error: err });
      }

      const deleteLoginQuery = 'DELETE FROM login WHERE id = ?';
      db.query(deleteLoginQuery, [id], (err, result) => {
        if (err) {
          console.error('Error deleting student:', err);
          return res.status(500).json({ message: 'Error deleting student', error: err });
        }
        res.json({ message: 'Student deleted successfully', id });
      });
    });
  });
});

//Machine Learning
// Define a route to fetch data from the database and dynamically generate HTML
app.get('/ML', (req, res) => {
  const id = 5; // Assuming you want to fetch data for a specific user ID
  const query = `SELECT student_course.course, student_course.exam_7th, student_course.exam_12th, student_course.classwork, gpa.C_GPA 
                 FROM student_course 
                 INNER JOIN gpa 
                 ON student_course.user_id = gpa.st_id 
                 WHERE student_course.user_id = 10;`;



  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    // console.log(results); // Debug: Check the data returned from the database

    let dropdownItems = results.map(result => `<a class="dropdown-item" href="#" onclick="updateTable('${result.course}');">${result.course}</a>`).join('');
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ML</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
        <link rel="stylesheet" href="css/styles.css">
    
        <style>
        body {

          padding-left: 80px;
          background-color: #f8f9fa;
    
        }
            .sidebar {
                position: fixed;
                height: 100%;
                top: 0;
                left: 0;
                padding-top: 20px;
                border-right: 1px solid #ddd;
            }
            .container {
                margin-left: 220px; /* Adjust based on sidebar width */
                padding: 20px;
                background-color: whitesmoke;
                text-align: center;
            }
            .profile-img {
                width: 30px;
                height: 30px;
                border-radius: 50%;
            }
            .custom-button img {
                width: 30px;
                height: 30px;
            }
            .dropdown-content {
                display: none;
                position: absolute;
                background-color: #f9f9f9;
                min-width: 160px;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                z-index: 1;
            }
            .dropdown-content a {
                color: black;
                padding: 12px 16px;
                text-decoration: none;
                display: block;
            }
            .dropdown-content a:hover {
                background-color: #f1f1f1;
            }
            .dropdown:hover .dropdown-content {
                display: block;
            }
        </style>
    </head>
    <body>
    <!-- Top Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <a class="nav-link" href="#" style="margin-left: 250px;">News</a>
                </li>
            </ul>
            <ul class="navbar-nav ml-auto">
                <li class="nav-item profile-container">
                    <a href="#" class="nav-link">
                        <img src="/images/1.jpg" alt="Student Profile" class="profile-img">
                    </a>
                </li>
                <li class="nav-item">
                    <!-- Notification dropdown -->
                    <div class="dropdown">
                        <button class="custom-button" style="margin-top: 8px;">
                            <img src="/images/bell.jpg" alt="Notifications" class="profile-img" title="Notifications">
                        </button>
                        <div class="dropdown-content">
                            <a href="#" class="notification">Notification 1</a>
                            <a href="#" class="notification">Notification 2</a>
                            <a href="#" class="notification">Notification 3</a>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </nav>
    
    <div class="row">
        <!-- Sidebar -->
        <nav class="col-md-2 d-none d-md-block bg-light sidebar">
            <div>
                <div class="sidebar-logo text-center">
                    <img src="/images/logo.png" alt="Logo" height="150px" width="150px">
                </div>
                <ul class="nav flex-column mt-3">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/Schedule.html">Schedule</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/index.html">Results</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/gpacalc.html">GPA Calculator</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/viewstudents.html">View Students</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="/change_grades.html">Change Grade</a>
                   </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/add&del.html">Manage Students</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/ML">ML Model</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/log.html">Log</a>
                    </li>
                </ul>
            </div>
        </nav>
    
        <div class="container col-md-10 offset-md-2" style="padding-top:200px;background-color: #f8f9fa;">
            <div class="dropdown">
                <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" style="margin-top: 10px;">
                    Select Subject
                </button>
                <div class="dropdown-menu" id="subjectDropdown">
                    ${dropdownItems}
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-12">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>7th Week (30%)</th>
                                <th>12th Week (20%)</th>
                                <th>Semester Work (10%)</th>
                                <th>Final Grade</th>
                            </tr>
                        </thead>
                        <tbody id="bodytable">
                            <!-- Subjects are displayed here (dynamically) upon user choice -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // JavaScript function to update table dynamically based on selected subject
        function updateTable(subject) {
            const selectedSubject = ${JSON.stringify(results)}.find(result => result.course === subject);
    
            if (selectedSubject) {
                const rowHTML = '<tr>' +
                    '<td>' + selectedSubject.course + '</td>' +
                    '<td>' + selectedSubject.exam_7th + '</td>' +
                    '<td>' + selectedSubject.exam_12th + '</td>' +
                    '<td>' + selectedSubject.classwork + '</td>' +
                    '<td><button id="predict" class="btn btn-danger" onclick="predictGrade()">Predict</button></td>' +
                '</tr>';
                document.getElementById('bodytable').innerHTML = rowHTML;
            }
        }
    
        function predictGrade() {
            const subject = document.querySelector('#bodytable tr td:first-child').textContent;
            const selectedSubject = ${JSON.stringify(results)}.find(result => result.course === subject);
    
            fetch('/mldata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ st: selectedSubject })
            })
            .then(response => response.json())
            .then(data => {
                var btn = document.getElementById('predict');
                btn.parentElement.textContent = data;
            })
            .catch(error => console.error('Error:', error));
        }
    </script>
    </body>
    </html>
    
    
    `;

    res.send(html);
  });
});

// Define a route to handle ML data prediction
app.post('/mldata', (req, res) => {
  const studentData = req.body.st;

  axios.post('http://localhost:4000/mldata', { st: studentData })
    .then(response => res.json(response.data))
    .catch(error => res.status(500).send(error));
});

//LOG

app.get('/logData', (req, res) => {
  const query = 'SELECT log.log_date, log.admin_id, login.fname AS adminFname, log.operation FROM log INNER JOIN login ON log.admin_id = login.id;';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results); // Send the query results as JSON response
  });
});


//change grade

app.get('/student_courses', (req, res) => {
  const query = 'SELECT user_id AS student_id, course, exam_7th, exam_12th, classwork, final_exam, grade FROM student_course';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post('/update_grade', (req, res) => {
  const { studentId, course, exam_7th, exam_12th, classwork, final_exam, grade } = req.body;

  const query = 'UPDATE student_course SET exam_7th = ?, exam_12th = ?, classwork = ?, final_exam = ?, grade = ? WHERE user_id = ? AND course = ?';

  db.query(query, [exam_7th, exam_12th, classwork, final_exam, grade, studentId, course], (err, result) => {
    if (err) {
      console.error('Error updating grade:', err);
      return res.status(500).json({ success: false, message: 'Error updating grade' });
    }
    res.json({ success: true, message: 'Grade updated successfully' });
  });
});


//Login
// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'html_login.html'));
});

// Serve home page
app.get('/home/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home_page.html'));
});

// Handle login form submission
app.post('/login', (req, res) => {
  const username = req.body.registration;
  const password = req.body.password;

  db.query('SELECT * FROM login WHERE id = ? AND passcode = ?', [username, password], (error, results) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length > 0) {
      const userType = results[0].user_type;
      const fname = results[0].fname;

      if (userType === 'student') {
        // Redirect to student home page
        res.redirect('/home/student?fname=' + encodeURIComponent(fname));
      } else if (userType === 'admin') {
        // Redirect to admin home page
        res.redirect('/home/admin?fname=' + encodeURIComponent(fname));
      }
    } else {
      res.redirect('/login?error=1');
    }
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});