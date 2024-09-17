function convert(grade) {
    let value;
    switch (grade) {
        case "A+":
            value = 4.0;
            break;
        case "A":
            value = 3.7;
            break;
        case "A-":
            value = 3.4;
            break;
        case "B+":
            value = 3.2;
            break;
        case "B":
            value = 3.0;
            break;
        case "B-":
            value = 2.8;
            break;
        case "C+":
            value = 2.6;
            break;
        case "C":
            value = 2.4;
            break;
        case "C-":
            value = 2.2;
            break;
        case "D+":
            value = 2.0;
            break;
        case "D":
            value = 1.5;
            break;
        case "D-":
            value = 1.0;
            break;
        case "F":
            value = 0.0;
            break;
        default:
            value = 0.0;
    }
    return value;
}

function GpaCalc() {
    let sum = 0;
    let totalhrs = 0;
    let finalgpa = 0;
    let sumpoints = 0;

    let grades = document.getElementsByClassName("custom-select");
    let hours = document.getElementsByClassName("form-control");

    for (let i = 0; i < grades.length; i++) {
        let gradeValue = convert(grades[i].value);
        let hoursValue = parseFloat(hours[i].value) || 0;

        sum += gradeValue * hoursValue;
        totalhrs += hoursValue;
    }

    if (totalhrs > 0) {
        finalgpa = sum / totalhrs;
    }

    document.getElementById("points").innerText = "Points: " + sum.toFixed(2);
    document.getElementById("CREDITFINAL").innerText = "Credit Hours: " + totalhrs;
    document.getElementById("GPAFINAL").innerText = "GPA: " + finalgpa.toFixed(2);
}



// Results Section
function calculateGrade(total) {
  if (total >= 95) {
    return 'A+';
  } else if (total >= 90) {
    return 'A';
  } else if (total >= 85) {
    return 'A-';
  } else if (total >= 80) {
    return 'B+';
  } else if (total >= 75) {
    return 'B';
  } else if (total >= 70) {
    return 'B-';
  } else if (total >= 65) {
    return 'C+';
  } else if (total >= 60) {
    return 'C';
  } else if (total >= 56) {
    return 'C-';
  } else if (total >= 53) {
    return 'D+';
  } else if (total >= 50) {
    return 'D';
  } else {
    return 'F';
  }
}

rows = document.getElementsByTagName('tr');

for (let i = 1; i < rows.length; i++) { // Start at 1 to skip the header row
  totalCell = rows[i].getElementsByClassName('total')[0];
  gradeCell = rows[i].getElementsByClassName('grade')[0];

  grade = calculateGrade(parseInt(totalCell.innerText));
  gradeCell.innerText = grade;

}








document.addEventListener('DOMContentLoaded', () => {
  fetch('/studentsinfo')
      .then(response => response.json())
      .then(data => {
          const tableBody = document.getElementById('studentsTableBody');
          data.forEach(student => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${student.id}</td>
                  <td>${student.passcode}</td>
                  <td>${student.fname}</td>
                  <td>${student.lname}</td>
                  <td>${student.email}</td>
                  <td>${student.user_type}</td>
                  <td>${student.term}</td>
                  <td><button class="btn btn-danger btn-sm" onclick="deleteStudent(this, ${student.id})">Remove</button></td>
              `;
              tableBody.appendChild(row);
          });
      })
      .catch(error => console.error('Error fetching student data:', error));

  const addStudentForm = document.getElementById('add-student-form');
  const studentsTableBody = document.getElementById('studentsTableBody');

  addStudentForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const studentId = document.getElementById('studentId').value;
      const passcode = document.getElementById('passcode').value;
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const userType = document.getElementById('userType').value;
      const term = document.getElementById('term').value;

      // Send POST request to add the student to the database
      fetch('/addstudent', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ studentId, passcode, firstName, lastName, email, userType, term })
      })
      .then(response => response.json())
      .then(data => {
          if (data.message) {
              displayMessage(data.message, 'success');
              addStudentToTable(studentId, passcode, firstName, lastName, email, userType, term);
          } else {
              displayMessage('Unexpected response format', 'danger');
          }
      })
      .catch(error => {
          displayMessage('Error adding student: ' + error, 'danger');
          console.error('Error adding student:', error);
      });

      // Clear form fields
      addStudentForm.reset();
  });

  function addStudentToTable(studentId, passcode, firstName, lastName, email, userType, term) {
      const row = document.createElement('tr');

      row.innerHTML = `
          <td>${studentId}</td>
          <td>${passcode}</td>
          <td>${firstName}</td>
          <td>${lastName}</td>
          <td>${email}</td>
          <td>${userType}</td>
          <td>${term}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteStudent(this, ${studentId})">Remove</button></td>
      `;

      studentsTableBody.appendChild(row);
  }

  window.deleteStudent = function(button, studentId) {
      const row = button.closest('tr');
      row.remove();

      // Send DELETE request to remove the student from the database
      fetch(`/deletestudent/${studentId}`, {
          method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
          console.log('Delete response:', data);  // Log the response
          if (data.message) {
              displayMessage(data.message, 'success');
          } else {
              displayMessage('Unexpected response format', 'danger');
          }
      })
      .catch(error => {
          displayMessage('Error deleting student: ' + error, 'danger');
          console.error('Error deleting student:', error);
      });
  }

  function displayMessage(message, type) {
      const messageDiv = document.getElementById('message');
      messageDiv.className = `alert alert-${type}`;
      messageDiv.innerText = message;
      messageDiv.style.display = 'block';
      setTimeout(() => {
          messageDiv.style.display = 'none';
      }, 3000);
  }
});