const API_BASE_URL = "https://expensex-aw2n.onrender.com";
// =================================
// AUTHENTICATION CHECK
// =================================

const token = localStorage.getItem("expenseXToken");


if (!token) {
    window.location.href = "pages/login.html";
}
// =========================
// AUTH CHECK
// =========================


/* ==========================================
   EXPENSEX - EXPENSE TRACKER
   JAVASCRIPT
========================================== */


/* ---------- GET HTML ELEMENTS ---------- */

const transactionForm = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const monthlyExpenseElement = document.getElementById("monthlyExpense");

const typeButtons = document.querySelectorAll(".type-btn");


/* ---------- TRANSACTION TYPE ---------- */

let transactionType = "expense";


typeButtons.forEach(button => {

    button.addEventListener("click", () => {

        typeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        transactionType = button.dataset.type;

    });

});


/* ---------- LOAD TRANSACTIONS ---------- */

let transactions = [];
async function loadTransactionsFromAPI() {

    try {

       const token = localStorage.getItem("expenseXToken");

const response = await fetch(
    `${API_BASE_URL}/api/transactions`,
    {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
);

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const data = await response.json();

        transactions = data;

        console.log("Transactions loaded from MongoDB:", transactions);

        renderTransactions();
        updateSummary();
        updateChart();

    } catch (error) {

        console.error("API load error:", error);

        alert("Could not load transactions from database.");
    }
}


/* ---------- SET TODAY'S DATE ---------- */

const today = new Date();

const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

dateInput.value = todayString;


/* ---------- FORMAT MONEY ---------- */

function formatMoney(amount) {
    const currency = localStorage.getItem("expenseXCurrency") || "₹";

    return currency + Number(amount).toLocaleString("en-IN");
}

/* ---------- SAVE TRANSACTIONS ---------- */

async function saveTransactionToAPI(transaction) {

    try {

       const token = localStorage.getItem("expenseXToken");

const response = await fetch(
   `${API_BASE_URL}/api/transactions`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

                body: JSON.stringify({
                    title: transaction.title,
                    amount: transaction.amount,
                    category: transaction.category,
                    date: transaction.date,
                    type: transaction.type,
                    currency: transaction.currency
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to save transaction");
        }

        const savedTransaction = await response.json();

        console.log("Transaction saved to MongoDB:", savedTransaction);

        return savedTransaction;

    } catch (error) {

        console.error("API save error:", error);
        alert("Could not save transaction to database.");

        return null;
    }
}


/* ---------- ADD TRANSACTION ---------- */

transactionForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const title = titleInput.value.trim();

    const amount = Number(amountInput.value);

    const category = categoryInput.value;

    const date = dateInput.value;
    const transactionCurrency =
    localStorage.getItem("expenseXCurrency") || "₹";


    /* ---------- VALIDATION ---------- */

    if (title === "") {

        alert("Please enter a description.");

        return;

    }


    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;

    }


    if (date === "") {

        alert("Please select a date.");

        return;

    }


    /* ---------- CREATE TRANSACTION ---------- */

    const transaction = {

        id: Date.now(),

        title: title,

        amount: amount,

        category: category,

        date: date,
        currency: localStorage.getItem("expenseXCurrency") || "₹",

        type: transactionType

    };


    /* ---------- ADD TO ARRAY ---------- */

   transactions.unshift(transaction);

/* ---------- SAVE TO MONGODB ---------- */

const savedTransaction = await saveTransactionToAPI(transaction);

if (savedTransaction) {
    transactions[0] = savedTransaction;
}

/* ---------- UPDATE UI ---------- */

renderTransactions();
updateSummary();
updateChart();


    /* ---------- RESET FORM ---------- */

    titleInput.value = "";

    amountInput.value = "";

    categoryInput.value = "Food";


    dateInput.value = todayString;


    /* ---------- RESET TYPE ---------- */

    transactionType = "expense";

    typeButtons.forEach(btn => {

        btn.classList.remove("active");

    });

    document
        .querySelector('[data-type="expense"]')
        .classList.add("active");


});

async function editTransaction(transaction) {

    const newTitle = window.prompt(
        "Enter transaction description:",
        transaction.title
    );

    if (newTitle === null) {
        return;
    }

    const newAmount = window.prompt(
        "Enter amount:",
        transaction.amount
    );

    if (newAmount === null) {
        return;
    }

    const newCategory = window.prompt(
        "Enter category:",
        transaction.category
    );

    if (newCategory === null) {
        return;
    }

    const token =
        localStorage.getItem("expenseXToken");

    try {

        const response = await fetch(
         `${API_BASE_URL}/api/transactions/${transaction._id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    title: newTitle,
                    amount: Number(newAmount),
                    category: newCategory,
                    date: transaction.date,
                    type: transaction.type,
                    currency: transaction.currency
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update transaction");
        }

        const updatedTransaction =
            await response.json();

        const index = transactions.findIndex(
            item => item._id === transaction._id
        );

        if (index !== -1) {
            transactions[index] = updatedTransaction;
        }

        renderTransactions();
        updateSummary();
        updateChart();

    } catch (error) {

        console.error(
            "Update transaction error:",
            error
        );

        alert("Could not update transaction.");
    }
}
/* ---------- DELETE TRANSACTION ---------- */
async function deleteTransaction(id) {

    try {

        const token = localStorage.getItem("expenseXToken");

const response = await fetch(
   `${API_BASE_URL}/api/transactions/${id}`,
    {
        method: "DELETE",

        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
);
        if (!response.ok) {
            throw new Error("Failed to delete transaction");
        }

        console.log("Transaction deleted from MongoDB");

        transactions = transactions.filter(
            transaction => transaction._id !== id
        );

        renderTransactions();
        updateSummary();
        updateChart();

    } catch (error) {

        console.error("Delete error:", error);

        alert("Could not delete transaction from database.");
    }
}


/* ---------- FORMAT DATE ---------- */

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


/* ---------- RENDER TRANSACTIONS ---------- */

function renderTransactions() {

    transactionList.innerHTML = "";


    /* ---------- EMPTY STATE ---------- */

    if (transactions.length === 0) {

        transactionList.innerHTML = `

            <tr class="empty-row">

                <td colspan="5">

                    No transactions yet.
                    Add your first transaction above.

                </td>

            </tr>

        `;

        return;

    }


    /* ---------- DISPLAY TRANSACTIONS ---------- */

    transactions.forEach(transaction => {

        const row = document.createElement("tr");


        const amountClass =
            transaction.type === "income"
                ? "income-amount"
                : "expense-amount";


        const amountSign =
            transaction.type === "income"
                ? "+"
                : "-";


        row.innerHTML = `

            <td>

                ${transaction.title}

            </td>


            <td>

                <span class="category-badge">

                    ${transaction.category}

                </span>

            </td>


            <td>

                ${formatDate(transaction.date)}

            </td>


            <td class="${amountClass}">

                ${amountSign}${formatMoney(transaction.amount)}

            </td>


            <td>

                <button

                    class="delete-btn"

                    onclick="deleteTransaction(${transaction.id})">

                    🗑

                </button>

            </td>

        `;

const actionCell = document.createElement("td");

const editButton = document.createElement("button");

editButton.type = "button";
editButton.textContent = "Edit";
editButton.className = "edit-btn";

editButton.onclick = function () {
    editTransaction(transaction);
};


const deleteButton = document.createElement("button");

deleteButton.type = "button";
deleteButton.textContent = "Delete";
deleteButton.className = "delete-btn";

deleteButton.onclick = function () {

    if (
        window.confirm(
            "Are you sure you want to delete this transaction?"
        )
    ) {
        deleteTransaction(transaction._id);
    }
};


actionCell.appendChild(editButton);
actionCell.appendChild(deleteButton);

row.appendChild(actionCell);
        transactionList.appendChild(row);

    });

}


/* ---------- UPDATE SUMMARY ---------- */

function updateSummary() {

const exchangeRatesToINR = {
    "₹": 1,
    "$": 83,
    "€": 97,
    "£": 112
};

function toINR(amount, currency) {
    return Number(amount) * (exchangeRatesToINR[currency] || 1);
}

const displayCurrency =
    localStorage.getItem("expenseXCurrency") || "₹";
    let totalIncome = 0;

    let totalExpenses = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            totalIncome += toINR(
    transaction.amount,
    transaction.currency || "₹"
);
        }

        else {

            totalExpenses += toINR(
    transaction.amount,
    transaction.currency || "₹"
);

        }

    });


    const balance = totalIncome - totalExpenses;


    /* ---------- UPDATE HTML ---------- */

   balanceElement.textContent =
    formatMoney(
        balance /
        (exchangeRatesToINR[displayCurrency] || 1)
    );

   incomeElement.textContent =
    formatMoney(
        totalIncome /
        (exchangeRatesToINR[displayCurrency] || 1)
    );

   expensesElement.textContent =
    formatMoney(
        totalExpenses /
        (exchangeRatesToINR[displayCurrency] || 1)
    );

    /* ---------- MONTHLY EXPENSE ---------- */

    const currentDate = new Date();

    const currentMonth =
        currentDate.getMonth();

    const currentYear =
        currentDate.getFullYear();


    let monthlyExpense = 0;


    transactions.forEach(transaction => {

        const transactionDate =
            new Date(transaction.date + "T00:00:00");


        if (

            transaction.type === "expense" &&

            transactionDate.getMonth() === currentMonth &&

            transactionDate.getFullYear() === currentYear

        ) {

           monthlyExpense += toINR(
    transaction.amount,
    transaction.currency || "₹"
);

        }

    });


   monthlyExpenseElement.textContent =
    formatMoney(
        monthlyExpense /
        (exchangeRatesToINR[displayCurrency] || 1)
    );

}


/* ---------- CHART ---------- */

let expenseChart;


/* ---------- UPDATE CHART ---------- */

function updateChart() {


    const categoryTotals = {};


    /* ---------- CALCULATE CATEGORY TOTALS ---------- */

    transactions.forEach(transaction => {

        if (transaction.type !== "expense") {

            return;

        }


        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }


       categoryTotals[transaction.category] +=
    toINR(
        transaction.amount,
        transaction.currency || "₹"
    );
    });


    const labels =
        Object.keys(categoryTotals);


    const data =
        Object.values(categoryTotals);


    /* ---------- GET CANVAS ---------- */

    const canvas =
        document.getElementById("expenseChart");


    if (!canvas) {

        return;

    }


    /* ---------- DESTROY OLD CHART ---------- */

    if (expenseChart) {

        expenseChart.destroy();

    }


    /* ---------- CREATE CHART ---------- */

    expenseChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{

                data: data,

                backgroundColor: [

                    "#6c5ce7",

                    "#20b26b",

                    "#ef5b63",

                    "#f59e0b",

                    "#3b82f6",

                    "#ec4899",

                    "#8b5cf6"

                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        padding: 15,

                        usePointStyle: true,

                        font: {

                            size: 11

                        }

                    }

                }

            }

        }

    });

}


/* ---------- INITIAL LOAD ---------- */

renderTransactions();

updateSummary();

updateChart();// SETTINGS NAVIGATION
const settingsLink = document.querySelector('a[href="#settings"]');

if (settingsLink) {
    settingsLink.addEventListener('click', function (e) {
        e.preventDefault();

        const settingsSection = document.getElementById('settings');

        if (settingsSection) {
            settingsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}// ================= LIGHT MODE =================

const themeButton = document.querySelector(
    '#settings button'
);

themeButton.addEventListener('click', function () {
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('light-mode')) {
        themeButton.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        themeButton.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
    }
});

// Keep the selected theme after refresh
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeButton.textContent = 'Dark Mode';
}// ================= CURRENCY =================

const currencySelect = document.getElementById("currencySelect");

if (currencySelect) {
    const savedCurrency =
        localStorage.getItem("expenseXCurrency") || "₹";

    currencySelect.value = savedCurrency;

    currencySelect.addEventListener("change", function () {
        localStorage.setItem(
            "expenseXCurrency",
            currencySelect.value
        );

        renderTransactions();
        updateSummary();
        updateChart();
    });
}// Update amount field currency symbol

function updateAmountCurrency() {
    if (!amountInput || !currencySelect) return;

    const symbols = {
        "₹": "₹",
        "$": "$",
        "€": "€",
        "£": "£"
    };

    const symbol = symbols[currencySelect.value] || "₹";

    amountInput.placeholder = symbol + " 0";
}

// Run when page loads
updateAmountCurrency();

// Run whenever currency changes
if (currencySelect) {
    currencySelect.addEventListener("change", updateAmountCurrency);
}
// LOAD TRANSACTIONS FROM MONGODB
loadTransactionsFromAPI();
// =========================
// LOGOUT
// =========================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("expenseXToken");
        localStorage.removeItem("expenseXUser");

        window.location.href =
            "pages/login.html";
    });
}
