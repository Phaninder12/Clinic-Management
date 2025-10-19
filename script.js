// Clinic Management System JS (Frontend Only, Doctor's Action Feature Added)

let patients = JSON.parse(localStorage.getItem("patients") || "[]");
let editIndex = -1;
let tokenCounter = parseInt(localStorage.getItem("tokenCounter") || "1");
let currentUserRole = localStorage.getItem("userRole") || null;

const patientForm = document.getElementById("patientForm");
const patientsTableBody = document.querySelector("#patientsTable tbody");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const loginForm = document.getElementById("loginForm");
const roleSelect = document.getElementById("roleSelect");
const logoutBtn = document.getElementById("logoutBtn");
const mainContent = document.getElementById("mainContent");

// --- LOGIN / LOGOUT ---

function showLogin() {
    mainContent.style.display = "none";
    loginForm.style.display = "block";
    logoutBtn.style.display = "none";
}

function showMain() {
    mainContent.style.display = "block";
    loginForm.style.display = "none";
    logoutBtn.style.display = "inline-block";
    showRoleUI();
    renderPatients(patients);
}

if (!currentUserRole) {
    showLogin();
} else {
    showMain();
}

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    currentUserRole = roleSelect.value;
    if (!currentUserRole) return;
    localStorage.setItem("userRole", currentUserRole);
    console.log(`[LOGIN] User logged in as ${currentUserRole}`);
    showMain();
});

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("userRole");
    currentUserRole = null;
    console.log("[LOGOUT] User logged out");
    showLogin();
});

// --- ROLE-BASED UI ---

function showRoleUI() {
    if (currentUserRole === "Doctor") {
        patientForm.style.display = "none";
        submitBtn.style.display = "none";
        cancelBtn.style.display = "none";
        formTitle.textContent = "Patient List (Doctor View)";
    } else if (currentUserRole === "Receptionist") {
        patientForm.style.display = "block";
        submitBtn.style.display = "inline-block";
        formTitle.textContent = editIndex === -1 ? "Add Patient" : "Update Patient";
    }
}

// --- PATIENT MANAGEMENT ---

patientForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const problem = document.getElementById("problem").value.trim();

    if (!name || !age || !gender || !problem) return;

    if (editIndex === -1) {
        // Add new
        const token = tokenCounter++;
        const patient = {
            name, age, gender, problem,
            token,
            charges: 0,
            prescription: "",
            actions: []
        };
        patients.push(patient);
        localStorage.setItem("tokenCounter", tokenCounter);
        console.log(`[ADD] Receptionist added patient: ${name}, Token: ${token}`);
    } else {
        // Update existing
        const prevToken = patients[editIndex].token;
        patients[editIndex] = {
            ...patients[editIndex],
            name, age, gender, problem
        };
        console.log(`[EDIT] Receptionist edited patient: ${name}, Token: ${prevToken}`);
        editIndex = -1;
        submitBtn.textContent = "Add Patient";
        formTitle.textContent = "Add Patient";
        cancelBtn.style.display = "none";
    }

    localStorage.setItem("patients", JSON.stringify(patients));
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

// --- TABLE RENDERING ---

function renderPatients(list) {
    patientsTableBody.innerHTML = "";

    list.forEach((patient, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${patient.name}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>${patient.problem}</td>
        <td>${patient.token}</td>
        <td>
            ${currentUserRole === "Receptionist"
                ? `<input type="number" min="0" placeholder="Charges" value="${patient.charges || ""}" style="width:70px;" />
                   <button class="bill-btn action-btn">Bill</button>
                   <div>₹${patient.charges ? patient.charges : "--"}</div>`
                : `₹${patient.charges ? patient.charges : "--"}`
            }
        </td>
        <td>
            ${currentUserRole === "Doctor"
                ? `<input type="text" placeholder="Prescription" value="${patient.prescription || ""}" style="width:100px;" />
                   <button class="presc-btn action-btn">Add</button>
                   <div>${patient.prescription || "--"}</div>
                   <div class="action-type-list">
                        ${patient.actions && patient.actions.length > 0 ?
                            patient.actions.map(act => `<div>${act}</div>`).join("") : ""}
                   </div>
                `
                : (patient.prescription || "--")
            }
        </td>
        <td>
            <div class="action-buttons">
            ${currentUserRole === "Receptionist"
                ? `<button class="edit-btn action-btn">Edit</button>
                   <button class="delete-btn action-btn">Delete</button>`
                : ""}
            ${currentUserRole === "Doctor"
                ? `<input type="text" class="action-type-input" placeholder="Type action..."/>
                   <button class="action-type-btn action-btn">Action</button>`
                : ""}
            </div>
        </td>
        `;
        patientsTableBody.appendChild(row);

        // Actions for Receptionist
        if (currentUserRole === "Receptionist") {
            // Edit
            row.querySelector(".edit-btn").onclick = () => editPatient(index);
            // Delete
            row.querySelector(".delete-btn").onclick = () => deletePatient(index);
            // Bill
            row.querySelector(".bill-btn").onclick = () => {
                const amt = parseFloat(row.querySelector('input[type="number"]').value) || 0;
                addCharges(index, amt);
            };
        }
        // Actions for Doctor
        if (currentUserRole === "Doctor") {
            row.querySelector(".presc-btn").onclick = () => {
                const presc = row.querySelector('input[type="text"]').value.trim();
                addPrescription(index, presc);
            };
            // Doctor's type action
            const actionInput = row.querySelector('.action-type-input');
            const actionBtn = row.querySelector('.action-type-btn');
            actionBtn.onclick = () => {
                const actionText = actionInput.value.trim();
                if (actionText) {
                    if (!patients[index].actions) patients[index].actions = [];
                    patients[index].actions.push(actionText);
                    localStorage.setItem("patients", JSON.stringify(patients));
                    console.log(`[ACTION] Doctor added action for token ${patients[index].token}: "${actionText}"`);
                    renderPatients(patients);
                }
            };
        }
    });
}

// Edit patient (Receptionist)
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
    showRoleUI();
}

// Delete patient (Receptionist)
function deletePatient(index) {
    if (confirm("Are you sure you want to delete this patient?")) {
        const removed = patients.splice(index, 1)[0];
        localStorage.setItem("patients", JSON.stringify(patients));
        console.log(`[DELETE] Receptionist deleted patient: ${removed.name}, Token: ${removed.token}`);
        renderPatients(patients);
    }
}

// Add/Update charges (Receptionist)
function addCharges(index, amount) {
    patients[index].charges = amount;
    localStorage.setItem("patients", JSON.stringify(patients));
    console.log(`[BILL] Receptionist assigned charges for token ${patients[index].token}: ₹${amount}`);
    renderPatients(patients);
}

// Add/Update prescription (Doctor)
function addPrescription(index, text) {
    patients[index].prescription = text;
    localStorage.setItem("patients", JSON.stringify(patients));
    console.log(`[PRESCRIPTION] Doctor added prescription for token ${patients[index].token}: "${text}"`);
    renderPatients(patients);
}

// --- SEARCH ---

searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    const filtered = patients.filter((p) =>
        p.name.toLowerCase().includes(query)
    );
    renderPatients(filtered);
});

// Initial render if logged in
if (currentUserRole) renderPatients(patients);