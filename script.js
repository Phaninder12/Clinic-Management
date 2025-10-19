// Clinic Management System JS

let patients = [];
let editIndex = -1;

const patientForm = document.getElementById("patientForm");
const patientsTableBody = document.querySelector("#patientsTable tbody");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

// Add or Update patient
patientForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const problem = document.getElementById("problem").value.trim();

  if (editIndex === -1) {
    // Add new
    patients.push({ name, age, gender, problem });
  } else {
    // Update existing
    patients[editIndex] = { name, age, gender, problem };
    editIndex = -1;
    submitBtn.textContent = "Add Patient";
    formTitle.textContent = "Add Patient";
    cancelBtn.style.display = "none";
  }

  patientForm.reset();
  renderPatients(patients);
});

// Cancel update
cancelBtn.addEventListener("click", () => {
  editIndex = -1;
  patientForm.reset();
  submitBtn.textContent = "Add Patient";
  formTitle.textContent = "Add Patient";
  cancelBtn.style.display = "none";
});

// Render patients table
function renderPatients(list) {
  patientsTableBody.innerHTML = "";

  list.forEach((patient, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
  <td>${patient.name}</td>
  <td>${patient.age}</td>
  <td>${patient.gender}</td>
  <td>${patient.problem}</td>
  <td>
    <div class="action-buttons">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  </td>
`;
    patientsTableBody.appendChild(row);
  });
}

// Edit patient
function editPatient(index) {
  const p = patients[index];
  document.getElementById("name").value = p.name;
  document.getElementById("age").value = p.age;
  document.getElementById("gender").value = p.gender;
  document.getElementById("problem").value = p.problem;

  editIndex = index;
  submitBtn.textContent = "Update Patient";
  formTitle.textContent = "Update Patient";
  cancelBtn.style.display = "inline-block";
}

// Delete patient
function deletePatient(index) {
  if (confirm("Are you sure you want to delete this patient?")) {
    patients.splice(index, 1);
    renderPatients(patients);
  }
}

// Search patients
searchInput.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  renderPatients(filtered);
});

// Initial render
renderPatients(patients);
