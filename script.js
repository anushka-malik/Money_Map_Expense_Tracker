function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}

// Event Listener for the signup button
document.getElementById('signupButton').addEventListener('click', function() {
  document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
});

window.onload = function() {
  const form = document.getElementById("authForm");
  const nameField = document.getElementById("nameField");
  const emailField = document.getElementById("emailField");
  const passwordField = document.getElementById("passwordField");
  const title = document.getElementById("title");
  const userList = document.getElementById("ul");
  const loggedInUserSpan = document.getElementById("loggedInUser");
  const expenseTrackerSection = document.getElementById("data");
  
  // Initialize variables
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const balance = document.getElementById("balance");
  const income = document.getElementById("income");
  const expense = document.getElementById("expense");
  const transactionList = document.getElementById("transactionList");
  const transactionForm = document.getElementById("transactionForm");
  const status = document.getElementById("status");

  // Switch to Sign In form
  document.getElementById("switchToSignIn").onclick = function() {
      title.innerHTML = "Sign In";
      nameField.style.display = "none"; // Hide name field for sign in
      document.getElementById("submit").innerText = "Log In";
      emailField.value = ""; // Clear email field
      passwordField.value = ""; // Clear password field
  };

  // Form submission handling
  form.onsubmit = function(e) {
      e.preventDefault();
      const name = nameField.style.display === "none" ? null : nameField.value;
      const email = emailField.value;
      const password = passwordField.value;

      if (name) { // Sign Up
          if (name && email && password) {
              const user = { name, email, password };
              let users = JSON.parse(localStorage.getItem("all_users")) || [];
              users.push(user);
              localStorage.setItem("all_users", JSON.stringify(users));
              addUserToList(user);
              updateLoggedInUser(user);
              form.reset();
              showExpenseTracker();
          } else {
              alert("Please fill in all fields");
          }
      } else { // Sign In
          const existingUsers = JSON.parse(localStorage.getItem("all_users")) || [];
          const foundUser = existingUsers.find(u => u.email === email && u.password === password);
          if (foundUser) {
              updateLoggedInUser(foundUser);
              form.reset();
              showExpenseTracker();
          } else {
              alert("Invalid email or password");
          }
      }
  };

  function showExpenseTracker() {
      expenseTrackerSection.style.display = "block"; // Show the expense tracker
      updateTotal(); // Update totals if needed
  }

  function addUserToList(user) {
      const li = document.createElement("li");
      li.textContent = user.name;
      userList.appendChild(li);
  }

  function updateLoggedInUser(user) {
      if (user) {
          loggedInUserSpan.textContent = user.name;
      } else {
          loggedInUserSpan.textContent = "None";
      }
  }

  // Load existing users on page load
  let users = JSON.parse(localStorage.getItem("all_users")) || [];
  users.forEach(addUserToList);
  updateLoggedInUser();

  // Function to update totals and render transaction list
  function updateTotal() {
      const incomeTotal = transactions
          .filter(trx => trx.type === "income")
          .reduce((total, trx) => total + trx.amount, 0);
  
      const expenseTotal = transactions
          .filter(trx => trx.type === "expense")
          .reduce((total, trx) => total + trx.amount, 0);
  
      const balanceTotal = incomeTotal - expenseTotal;
  
      balance.textContent = `$${balanceTotal.toFixed(2)}`;
      income.textContent = `$${incomeTotal.toFixed(2)}`;
      expense.textContent = `$${expenseTotal.toFixed(2) * -1}`;
  }

  // Function to render transaction list
  function renderList() {
      transactionList.innerHTML = "";
      status.textContent = "";
      if (transactions.length === 0) {
          status.textContent = "No transactions.";
          return;
      }

      transactions.forEach(({ id, name, amount, date, type }) => {
          const sign = type === "income" ? 1 : -1;

          const li = document.createElement("li");
          li.innerHTML = `
              <div class="name">
                  <h4>${name}</h4>
                  <p>${new Date(date).toLocaleDateString()}</p>
              </div>
              <div class="amount ${type}">
                  <span>${(amount * sign).toFixed(2)}</span>
              </div>
              <div class="action">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </div>
          `;
          transactionList.appendChild(li);
      });
  }

  // Function to delete transaction
  function deleteTransaction(id) {
      const index = transactions.findIndex(trx => trx.id === id);
      transactions.splice(index, 1);
      updateTotal();
      saveTransactions();
      renderList();
  }

  // Function to add transaction
  transactionForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      transactions.push({
          id: transactions.length + 1,
          name: formData.get("name"),
          amount: parseFloat(formData.get("amount")),
          date: new Date(formData.get("date")),
          type: document.getElementById("type").checked ? "income" : "expense",
      });

      this.reset();
      updateTotal();
      saveTransactions();
      renderList();
  });

  // Function to save transactions to local storage
  function saveTransactions() {
      localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Initial render
  renderList();
  updateTotal();
}