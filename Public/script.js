const API_URL = 'http://localhost:3500/students';

function generateUID() {
  return 'xxxxxxxxyxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Add student
async function addPerson(event) {
  event.preventDefault();  

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("Both name and email are required.");
    return;
  }

  const uid = generateUID();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name, email })
    });

    if (!res.ok) throw new Error("Failed to add student");

    closeForm();
    loadAndRenderStudents();
  } catch (error) {
    alert("Error adding student: " + error.message);
  }
}

function openForm() {
  document.getElementById("popupForm").style.display = "block";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
}

function closeForm() {
  document.getElementById("popupForm").style.display = "none";
}

// Fetch all students
async function fetchStudents() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch students");
    return await res.json();
  } catch (error) {
    alert("Error loading students: " + error.message);
    return [];
  }
}

// Render table
function renderTable(people) {
  const tbody = document.querySelector("#personTable tbody");
  tbody.innerHTML = "";

  people.forEach(person => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${person.uid || '-'}</td>
      <td>${person.name}</td>
      <td>${person.email}</td>
      <td>
        <button class="btn-1" onclick="viewPerson('${person.uid}')">View</button>
        <button class="btn-1" onclick="showEditForm('${person.uid}', '${person.name}', '${person.email}')">Edit</button>
        <button class="btn-1" onclick="deletePerson('${person.uid}', '${person.name}', '${person.email}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}


// Search by UID and display in table
async function searchStudentByUID() {
  const uid = document.getElementById("searchUID").value.trim();

  if (!uid) {
    alert("Please enter a student UID.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${uid}`);
    if (!res.ok) {
      alert(`No student found with UID: ${uid}`);
      return;
    }

    const student = await res.json();

    renderTable([student]);

  } catch (error) {
    alert("Error searching for student: " + error.message);
  }
}



// View student details
async function viewPerson(uid) {
  try {
    const res = await fetch(`${API_URL}/${uid}`);
    if (!res.ok) throw new Error("Student not found");

    const person = await res.json();

    const content = `
     <div class="border">
       <h3>Student Details</h3>
     </div>
     <div class="border-1">
      <a class="view" href="./index.html">Back to list</a>
      <p><strong>UID:</strong> ${person.uid}</p>
      <p><strong>Name:</strong> ${person.name}</p>
      <p><strong>Email:</strong> ${person.email}</p>
      <button class="btn" onclick="closePopupModal()">Close</button>
     </div>
    `;
    showPopupModal(content);
  } catch (error) {
    alert("Error fetching student details: " + error.message);
  }
}

// Show edit form
function showEditForm(uid, name, email) {
  const content = `
   <div class="border">
      <h3>Edit Student</h3>
   </div>
   <div class="border-1">
     <form onsubmit="updateStudent(event, '${uid}')">
       <label>Name:</label><br/>
       <input type="text" id="editName" value="${name}" required><br><br>
       <label>Email:</label><br>
       <input type="email" id="editEmail" value="${email}" required><br><br>
       <button class="btn" type="submit">Save Changes</button>
       <button class="btn" type="button" onclick="closePopupModal()">Cancel</button>
     </form>
   </div>
  `;
  showPopupModal(content);
}

// Update student
async function updateStudent(event, uid) {
  event.preventDefault();

  const updatedName = document.getElementById("editName").value.trim();
  const updatedEmail = document.getElementById("editEmail").value.trim();

  if (!updatedName || !updatedEmail) {
    alert("Both name and email are required.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${uid}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updatedName, email: updatedEmail }),
    });

    if (!res.ok) throw new Error("Failed to update student");

    closePopupModal();
    loadAndRenderStudents();
  } catch (error) {
    alert("Error updating student: " + error.message);
  }
}

// Delete student
let studentToDeleteUID = null;

function deletePerson(uid, name, email) {
  studentToDeleteUID = uid;

  const content = `
    <div class="border">
      <h3>Confirm Delete</h3>
    </div>
    <div class="border-1">
      <p>Are you sure you want to delete <strong><br />
      ${name}</strong> (${email})?</p>
      <button class="btn" onclick="confirmDeleteStudent()">Delete</button>
      <button class="btn" onclick="closePopupModal()">Cancel</button>
    </div>
  `;
  showPopupModal(content);
}

async function confirmDeleteStudent() {
  try {
    const res = await fetch(`${API_URL}/${studentToDeleteUID}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error("Failed to delete student");

    closePopupModal();
    loadAndRenderStudents();
  } catch (error) {
    alert("Error deleting student: " + error.message);
  }
}

// Modal utilities
function showPopupModal(htmlContent) {
  document.getElementById("popupContent").innerHTML = htmlContent;
  document.getElementById("popupModal").style.display = "block";
}

function closePopupModal() {
  document.getElementById("popupModal").style.display = "none";
  studentToDeleteUID = null;
}

// Initial load
async function loadAndRenderStudents() {
  const people = await fetchStudents();
  renderTable(people);
}

loadAndRenderStudents();
