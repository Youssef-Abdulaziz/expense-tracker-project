// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).
const API_URL = "http://localhost:3000/api/expenses";

const CATEGORY_COLORS = {
  Food: "success",
  Transport: "primary",
  Bills: "warning",
  Entertainment: "info",
  Other: "secondary"
};
const ALLOWED_CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

async function getExpenses(){
  const response = await fetch(API_URL)
  if(!response.ok){
    throw new Error(`Request failed with status ${response.status}`);
  }
  return await response.json();
}

let currentExpenses = [];

//Adding the spinner 
function showSpinner(){
  document.getElementById("spinner").classList.remove("d-none");
  console.log("showspinner")

}
//Removing the spinner 
function hideSpinner(){
  document.getElementById("spinner").classList.add("d-none");
  console.log("hidespinner")
}

async function refresh() {
  showSpinner();
  try {
    currentExpenses = await getExpenses();
    renderSummary(currentExpenses);
    applyFilter();
  } catch (error) {
    console.log(error);
    alert("Failed to load expenses: " + error.message);
  }finally{
    hideSpinner();
  }
}
refresh();
function applyFilter() {
  const selectedCategory = document.getElementById("category-filter").value;
  const searchTitle = document.getElementById("title-search").value
    .trim()
    .toLowerCase();

  const filtered = currentExpenses.filter(expense => {
    const matchesCategory =
      selectedCategory === "All" ||
      expense.category === selectedCategory;

    const matchesTitle =
      expense.title.toLowerCase().includes(searchTitle);

    return matchesCategory && matchesTitle;
  });

  renderTable(filtered);
}

document.getElementById("category-filter").addEventListener("change", applyFilter);
document
  .getElementById("title-search")
  .addEventListener("input", applyFilter);


function renderSummary(list){
  const totalEl = document.getElementById("summary-total");
  const countEl = document.getElementById("summary-count");
  const highestEl = document.getElementById("summary-highest");

  if (list.length === 0) {
    totalEl.textContent = "$0.00";
    countEl.textContent = "0";
    highestEl.textContent = "$0.00";
    return;
  }

  const total = list.reduce((sum, expense) => sum + expense.amount, 0);
  const highest = Math.max(...list.map(expense => expense.amount));

  totalEl.textContent = "$" + total.toFixed(2);
  countEl.textContent = list.length;
  highestEl.textContent = "$" + highest.toFixed(2);
}

function renderTable(list) {
  const tbody = document.getElementById("expenses-table-body");
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No expenses found</td></tr>`;
    return;
  }

  list.forEach(expense => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.title}</td>
      <td>$${expense.amount.toFixed(2)}</td>
      <td><span class="badge bg-${CATEGORY_COLORS[expense.category]}">${expense.category}</span></td>
      <td>${expense.date}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${expense.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${expense.id}">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}
async function addExpense(data){
  const response = await fetch(API_URL, {method : "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)});
  const result = await response.json();

  if (!response.ok) {
  throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

/////////////////

function showAlert(message, containerId = "alert-container") {
  document.getElementById(containerId).innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}
function friendlyMessage(error) {
  // fetch throws a TypeError when it can't reach the server at all
  if (error instanceof TypeError) {
    return "Can't reach the server. Make sure the backend is running on port 3000.";
  }
  return error.message;
}

function setFieldError(field, message) {
  const input = document.getElementById(`input-${field}`);
  const error = document.getElementById(`error-${field}`);

  if (message) {
    input.classList.add("is-invalid");
    error.textContent = message;
  } else {
    input.classList.remove("is-invalid");
    error.textContent = "";
  }
}

function validateExpense(data) {
  let valid = true;

  const checks = {
    title: data.title === "" ? "Title is required" : "",
    amount: !(data.amount > 0) ? "Amount must be a number greater than 0" : "",
    category: !ALLOWED_CATEGORIES.includes(data.category) ? "Please choose a category" : "",
    date: data.date === "" ? "Date is required" : ""
  };

  for (const field in checks) {
    setFieldError(field, checks[field]);
    if (checks[field]) valid = false;
  }

  return valid;
}
const form = document.getElementById("expense-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    title: document.getElementById("input-title").value.trim(),
    amount: Number(document.getElementById("input-amount").value),
    category: document.getElementById("input-category").value,
    date: document.getElementById("input-date").value
  };

  if (!validateExpense(data)) return;

  try {
    await addExpense(data);
    form.reset();
    await refresh();
  } catch (error) {
    console.log(error);
    showAlert(error.message);
  }
});

//DELETE 
async function deleteExpense(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

const deleteModal = new bootstrap.Modal(document.getElementById("delete-modal"));
let pendingDeleteId = null;

document.getElementById("expenses-table-body").addEventListener("click", (event) => {
  const deleteBtn = event.target.closest(".btn-delete");
  const editBtn = event.target.closest(".btn-edit");

  if (deleteBtn) {
    pendingDeleteId = deleteBtn.dataset.id;
    deleteModal.show();
  }

  if (editBtn) {
    openEditModal(Number(editBtn.dataset.id));
  }
});

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
  try {
    await deleteExpense(pendingDeleteId);
    deleteModal.hide();
    await refresh();
  } catch (error) {
    deleteModal.hide();
    showAlert(friendlyMessage(error));
  }
});
///EDIT
function setFieldError(field, message, formType = "add") {
  const inputId = formType === "add" ? `input-${field}` : `edit-input-${field}`;
  const errorId = formType === "add" ? `error-${field}` : `edit-error-${field}`;
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (message) {
    input.classList.add("is-invalid");
    error.textContent = message;
  } else {
    input.classList.remove("is-invalid");
    error.textContent = "";
  }
}

function validateExpense(data, formType = "add") {
  let valid = true;

  const checks = {
    title: data.title === "" ? "Title is required" : "",
    amount: !(data.amount > 0) ? "Amount must be a number greater than 0" : "",
    category: !ALLOWED_CATEGORIES.includes(data.category) ? "Please choose a category" : "",
    date: data.date === "" ? "Date is required" : ""
  };

  for (const field in checks) {
    setFieldError(field, checks[field], formType);
    if (checks[field]) valid = false;
  }

  return valid;
}

async function updateExpense(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

const editModal = new bootstrap.Modal(document.getElementById("edit-modal"));
const editForm = document.getElementById("edit-form");

function openEditModal(id) {
  const expense = currentExpenses.find(e => e.id === id);
  if (!expense) return;

  document.getElementById("edit-id").value = expense.id;
  document.getElementById("edit-input-title").value = expense.title;
  document.getElementById("edit-input-amount").value = expense.amount;
  document.getElementById("edit-input-category").value = expense.category;
  document.getElementById("edit-input-date").value = expense.date;

  document.getElementById("edit-alert").innerHTML = "";
  ["title", "amount", "category", "date"].forEach(f => setFieldError(f, "", "edit"));

  editModal.show();
}

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("edit-id").value;
  const data = {
    title: document.getElementById("edit-input-title").value.trim(),
    amount: Number(document.getElementById("edit-input-amount").value),
    category: document.getElementById("edit-input-category").value,
    date: document.getElementById("edit-input-date").value
  };

  if (!validateExpense(data, "edit")) return;

  try {
    await updateExpense(id, data);
    editModal.hide();
    await refresh();
  } catch (error) {
    showAlert(friendlyMessage(error), "edit-alert");
  }
});