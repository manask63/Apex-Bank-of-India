/*
 * Apex Bank of India - Main JavaScript
 * College / educational banking project.
 * All JavaScript for every page is kept in this single file.
 */

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("show");
}

function showLogin() {
  const login = document.getElementById("loginForm");
  const register = document.getElementById("registerForm");
  const forgot = document.getElementById("forgotForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (login) login.style.display = "block";
  if (register) register.style.display = "none";
  if (forgot) forgot.style.display = "none";
  if (loginTab) loginTab.classList.add("active");
  if (registerTab) registerTab.classList.remove("active");
}

function showRegister() {
  const login = document.getElementById("loginForm");
  const register = document.getElementById("registerForm");
  const forgot = document.getElementById("forgotForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (login) login.style.display = "none";
  if (register) register.style.display = "block";
  if (forgot) forgot.style.display = "none";
  if (loginTab) loginTab.classList.remove("active");
  if (registerTab) registerTab.classList.add("active");
}

function showForgotPassword() {
  const login = document.getElementById("loginForm");
  const register = document.getElementById("registerForm");
  const forgot = document.getElementById("forgotForm");

  if (login) login.style.display = "none";
  if (register) register.style.display = "none";
  if (forgot) forgot.style.display = "block";
  document.getElementById("loginTab")?.classList.remove("active");
  document.getElementById("registerTab")?.classList.remove("active");
}

function isStrongPassword(password) {
  return password.length >= 8 && /[^A-Za-z0-9]/.test(password);
}

function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

function showModal(title, message, icon) {
  const modal = document.getElementById("bankModal");
  if (!modal) return;

  const titleEl = document.getElementById("modalTitle");
  const messageEl = document.getElementById("modalMessage");
  const iconEl = document.getElementById("modalIcon");

  if (titleEl) titleEl.textContent = title || "Apex Bank";
  if (messageEl) messageEl.textContent = message || "";
  if (iconEl) iconEl.textContent = icon || "✓";

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  const modal = document.getElementById("bankModal");
  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function closeModalOnOverlay(event) {
  if (event.target && event.target.id === "bankModal") closeModal();
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------------- Authentication ---------------- */

function validateRegister(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const phone = document.getElementById("regPhone").value.trim();
  const username = document.getElementById("regUsername").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirmPassword").value;

  if (!name || !email || !phone || !username || !password || !confirm) {
    showModal("Registration Failed", "Please fill all required fields.", "!");
    return;
  }

  if (!isValidPhone(phone)) {
    showModal("Invalid Phone Number", "Phone number must contain exactly 10 digits.", "!");
    return;
  }

  if (!isStrongPassword(password)) {
    showModal("Weak Password", "Password must contain at least 8 characters and one special character such as @, #, $ or !.", "!");
    return;
  }

  if (password !== confirm) {
    showModal("Registration Failed", "Password and Confirm Password do not match.", "!");
    return;
  }

  const users = readJSON("apexBankUsers", []);

  if (users.some(user => user.email === email || user.username === username)) {
    showModal("Already Registered", "This email or username is already registered on this browser.", "!");
    return;
  }

  const accountNumber = "APX" + Date.now().toString().slice(-8);
  const user = {
    name,
    email,
    phone,
    username,
    password,
    accountNumber,
    registeredAt: new Date().toLocaleString("en-IN"),
    accountOpened: false,
    accountType: "",
    cardType: "",
    kycStatus: "Pending",
    balance: 0,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeJSON("apexBankUsers", users);
  setCurrentUser(user);

  document.getElementById("registerForm").reset();

  showModal(
    "Registration Successful 🎉",
    "Registration complete. Next, choose Savings or Current Account and select your card.",
    "✓"
  );

  setTimeout(() => {
    window.location.href = "account-opening.html";
  }, 700);
}

function validateLogin(event) {
  event.preventDefault();

  const identity = document.getElementById("loginUser").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const users = readJSON("apexBankUsers", []);

  const oldUser = readJSON("apexBankUser", null);
  if (users.length === 0 && oldUser) users.push(oldUser);

  const user = users.find(currentUser =>
    (identity === currentUser.email || identity === currentUser.username) &&
    password === currentUser.password
  );

  if (!user) {
    showModal("Login Failed", "Invalid email/username or password.", "!");
    return;
  }

  setCurrentUser(user);

  showModal(
    "Login Successful 🎉",
    "Welcome to Apex Bank of India. Your personal home page will open shortly.",
    "✓"
  );

  setTimeout(() => {
    window.location.href = "user-home.html";
  }, 900);
}

function resetForgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
  const phone = document.getElementById("forgotPhone").value.trim();
  const password = document.getElementById("forgotPassword").value;
  const confirm = document.getElementById("forgotConfirmPassword").value;
  const users = readJSON("apexBankUsers", []);

  if (!isValidPhone(phone)) {
    showModal("Invalid Phone Number", "Phone number must contain exactly 10 digits.", "!");
    return;
  }

  if (!isStrongPassword(password)) {
    showModal("Weak Password", "New password must contain at least 8 characters and one special character.", "!");
    return;
  }

  if (password !== confirm) {
    showModal("Password Mismatch", "New password and confirmation do not match.", "!");
    return;
  }

  const index = users.findIndex(user => user.email === email && user.phone === phone);
  if (index === -1) {
    showModal("Verification Failed", "No matching account was found for the supplied email and phone number.", "!");
    return;
  }

  users[index].password = password;
  writeJSON("apexBankUsers", users);

  if (localStorage.getItem("apexUserEmail") === email) {
    setCurrentUser(users[index]);
  }

  document.getElementById("forgotForm").reset();
  showModal("Password Reset Successful", "Your demo password has been updated. You can now login with the new password.", "✓");
  setTimeout(showLogin, 500);
}

function getCurrentUser() {
  const users = readJSON("apexBankUsers", []);
  const email = (localStorage.getItem("apexUserEmail") || "").toLowerCase();

  if (email) {
    const user = users.find(item => item.email === email);
    if (user) {
      localStorage.setItem("apexBankUser", JSON.stringify(user));
      return user;
    }
  }

  return readJSON("apexBankUser", null);
}

function setCurrentUser(user) {
  if (!user) return;

  localStorage.setItem("apexLoggedIn", "true");
  localStorage.setItem("apexUserEmail", user.email || "");
  localStorage.setItem("apexBankUser", JSON.stringify(user));
}

function saveCurrentUser(user) {
  if (!user) return;

  setCurrentUser(user);
  const users = readJSON("apexBankUsers", []);
  const index = users.findIndex(item => item.email === user.email);

  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }

  writeJSON("apexBankUsers", users);
}

function requireUser() {
  const loggedIn = localStorage.getItem("apexLoggedIn") === "true";
  const user = getCurrentUser();

  if (!loggedIn || !user) {
    window.location.href = "login.html";
    return null;
  }

  return user;
}

/* Logout happens ONLY when the user explicitly clicks Logout. */
function logoutUser() {
  localStorage.removeItem("apexLoggedIn");
  localStorage.removeItem("apexUserEmail");
  localStorage.removeItem("apexBankUser");

  showModal("Logged Out", "You have been logged out successfully.", "✓");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 700);
}

/* ---------------- Transaction & Balance ---------------- */

function transactionKey(user) {
  return user && (user.accountNumber || user.email)
    ? "apexTransactions_" + (user.accountNumber || user.email)
    : "apexTransactions_guest";
}

function getTransactions(user) {
  if (!user) return [];
  return readJSON(transactionKey(user), []);
}

function saveTransactions(user, transactions) {
  if (user) writeJSON(transactionKey(user), transactions);
}

function getBalance(user) {
  if (!user) return 0;

  if (typeof user.balance !== "number") {
    user.balance = user.accountOpened ? Number(user.initialDeposit || 0) : 0;
    saveCurrentUser(user);
  }

  return Number(user.balance || 0);
}

function addTransaction(user, details) {
  if (!user) return;

  const transactions = getTransactions(user);
  transactions.push({
    id: "TXN" + Date.now() + Math.floor(Math.random() * 1000),
    date: new Date().toLocaleString("en-IN"),
    timestamp: new Date().toISOString(),
    accountNumber: user.accountNumber,
    ...details
  });

  saveTransactions(user, transactions);
}

function ensureDemoBalance(user) {
  if (!user) return;

  if (typeof user.balance !== "number") {
    user.balance = user.accountOpened ? Number(user.initialDeposit || 0) : 0;

    if (user.accountOpened && user.balance === 0 && getTransactions(user).length === 0) {
      user.balance = 25000;
      addTransaction(user, {
        type: "Credit",
        description: "Demo opening balance",
        amount: 25000,
        balanceAfter: 25000,
        mode: "Demo"
      });
    }

    saveCurrentUser(user);
  }
}

/* ---------------- Account Opening ---------------- */

function submitAccountOpening(event) {
  event.preventDefault();

  const user = requireUser();
  if (!user) return;

  if (user.accountOpened) {
    showModal("Account Already Opened", "Your account is already active. Open Account is available only once.", "!");
    setTimeout(() => window.location.href = "user-home.html", 700);
    return;
  }

  const accountType = document.getElementById("accountType").value;
  const cardType = document.getElementById("cardType").value;
  const initialDeposit = Number(document.getElementById("initialDeposit").value || 0);

  if (!accountType || !cardType) {
    showModal("Account Opening", "Please select account type and card type.", "!");
    return;
  }

  user.accountOpened = true;
  user.accountType = accountType;
  user.cardType = cardType;
  user.initialDeposit = initialDeposit;
  user.accountStatus = "Active (Demo)";
  user.accountOpenedAt = new Date().toLocaleString("en-IN");
  user.balance = initialDeposit;

  if (initialDeposit > 0) {
    addTransaction(user, {
      type: "Credit",
      description: "Initial account deposit",
      amount: initialDeposit,
      balanceAfter: initialDeposit,
      mode: "Account Opening"
    });
  }

  saveCurrentUser(user);

  showModal("Account Opened 🎉", `${accountType} created successfully with ${cardType}.`, "✓");
  setTimeout(() => window.location.href = "dashboard.html", 900);
}

/* ---------------- KYC ---------------- */

function submitKYC(event) {
  event.preventDefault();

  const user = requireUser();
  if (!user) return;

  if (!user.accountOpened) {
    showModal("Open Account First", "Please open a Savings or Current Account before completing KYC.", "!");
    setTimeout(() => window.location.href = "account-opening.html", 800);
    return;
  }

  const name = document.getElementById("kycName").value.trim();
  const docType = document.getElementById("kycDocType").value;
  const docRef = document.getElementById("kycDocRef").value.trim();
  const dob = document.getElementById("kycDob").value;

  if (!name || !docType || !docRef || !dob) {
    showModal("KYC Required", "Please complete all KYC fields using demo information.", "!");
    return;
  }

  user.kycStatus = "Submitted";
  user.kyc = {
    name,
    documentType: docType,
    documentReference: docRef,
    dob,
    submittedAt: new Date().toLocaleString("en-IN")
  };

  saveCurrentUser(user);

  const records = readJSON("apexKYCApplications", []);
  records.push({
    accountNumber: user.accountNumber,
    email: user.email,
    name,
    documentType: docType,
    documentReference: docRef,
    dob,
    status: "Submitted",
    submittedAt: new Date().toLocaleString("en-IN")
  });
  writeJSON("apexKYCApplications", records);

  document.querySelector("#kycName")?.closest("form")?.reset();
  showModal("KYC Submitted", "Your demo KYC application has been submitted for review.", "✓");
  setTimeout(() => window.location.href = "dashboard.html", 900);
}

/* ---------------- Cash Transfer ---------------- */

function submitCashTransfer(event) {
  event.preventDefault();

  const user = requireUser();
  if (!user) return;

  if (!user.accountOpened) {
    showModal("Open Account First", "Please open an account before making a transfer.", "!");
    setTimeout(() => window.location.href = "account-opening.html", 800);
    return;
  }

  const beneficiaryName = document.getElementById("beneficiaryName").value.trim();
  const beneficiaryAccount = document.getElementById("beneficiaryAccount").value.trim();
  const transferMode = document.getElementById("transferMode").value;
  const amount = Number(document.getElementById("transferAmount").value);
  const remarks = document.getElementById("transferRemarks").value.trim();

  if (!beneficiaryName || !beneficiaryAccount || !transferMode || !amount || amount <= 0) {
    showModal("Transfer Failed", "Please enter valid transfer details.", "!");
    return;
  }

  ensureDemoBalance(user);
  const balance = getBalance(user);

  if (amount > balance) {
    showModal("Insufficient Balance", `Available balance is ₹${balance.toLocaleString("en-IN")}. Please enter a lower transfer amount.`, "!");
    return;
  }

  const transfers = readJSON("apexCashTransfers", []);
  transfers.push({
    senderAccount: user.accountNumber,
    senderName: user.name,
    senderEmail: user.email,
    beneficiaryName,
    beneficiaryAccount,
    transferMode,
    amount,
    remarks,
    status: "Completed (Demo)",
    transferredAt: new Date().toLocaleString("en-IN")
  });
  writeJSON("apexCashTransfers", transfers);

  user.balance = balance - amount;
  saveCurrentUser(user);

  addTransaction(user, {
    type: "Debit",
    description: `Transfer to ${beneficiaryName}`,
    amount,
    balanceAfter: user.balance,
    mode: transferMode,
    reference: beneficiaryAccount,
    remarks: remarks || ""
  });

  document.querySelector("#beneficiaryName")?.closest("form")?.reset();
  showModal("Transfer Successful", `Demo transfer of ₹${amount.toLocaleString("en-IN")} completed. New balance: ₹${user.balance.toLocaleString("en-IN")}. No real money was transferred.`, "✓");
}

/* ---------------- Loan Applications ---------------- */

function submitLoanApplication(event) {
  event.preventDefault();

  const user = requireUser();
  if (!user) return;

  if (!user.accountOpened) {
    showModal("Open Account First", "Please open a Savings or Current Account before applying for a loan.", "!");
    setTimeout(() => window.location.href = "account-opening.html", 800);
    return;
  }

  const name = user.name;
  const phone = user.phone;
  const loanType = document.getElementById("loanType").value;
  const amount = Number(document.getElementById("loanApplyAmount").value);
  const tenure = Number(document.getElementById("loanTenure").value);

  if (!isValidPhone(phone)) {
    showModal("Invalid Phone", "Your registered phone number must contain exactly 10 digits.", "!");
    return;
  }

  if (!loanType || !amount || amount <= 0 || !tenure) {
    showModal("Application Incomplete", "Please select loan type, amount and tenure.", "!");
    return;
  }

  const loans = readJSON("apexLoanApplications", []);
  const hasPending = loans.some(loan =>
    ((user.accountNumber && loan.accountNumber === user.accountNumber) ||
      (user.email && loan.email === user.email)) &&
    loan.status === "Pending"
  );

  if (hasPending) {
    showModal("Loan Already Pending", "You already have a pending loan application. Please wait for admin review.", "!");
    return;
  }

  loans.push({
    accountNumber: user.accountNumber,
    name,
    phone,
    email: user.email,
    loanType,
    amount,
    tenure,
    status: "Pending",
    appliedAt: new Date().toLocaleString("en-IN")
  });

  writeJSON("apexLoanApplications", loans);
  document.getElementById("loanApplicationForm")?.reset();
  showModal("Application Submitted", "Your instant-loan application has been submitted for demo review.", "✓");
}

function submitEmergencyLoan(event) {
  event.preventDefault();

  const user = requireUser();
  if (!user) return;

  if (!user.accountOpened) {
    showModal("Open Account First", "Please open a Savings or Current Account before applying for an emergency loan.", "!");
    setTimeout(() => window.location.href = "account-opening.html", 800);
    return;
  }

  const amount = Number(document.getElementById("emergencyLoanAmount").value);
  const tenure = Number(document.getElementById("emergencyLoanTenure").value);
  const purpose = document.getElementById("emergencyLoanPurpose").value;

  if (!amount || amount < 1000 || amount > 20000) {
    showModal("Loan Amount Limit", "Emergency loan amount must be between ₹1,000 and ₹20,000.", "!");
    return;
  }

  if (!tenure || !purpose) {
    showModal("Application Incomplete", "Please select tenure and purpose.", "!");
    return;
  }

  const loans = readJSON("apexLoanApplications", []);
  const hasPending = loans.some(loan =>
    ((user.accountNumber && loan.accountNumber === user.accountNumber) ||
      (user.email && loan.email === user.email)) &&
    loan.status === "Pending"
  );

  if (hasPending) {
    showModal("Loan Already Pending", "You already have a pending loan application. Please wait for admin review.", "!");
    return;
  }

  loans.push({
    accountNumber: user.accountNumber,
    name: user.name,
    phone: user.phone,
    email: user.email,
    loanType: "Emergency Loan",
    amount,
    tenure,
    purpose,
    status: "Pending",
    appliedAt: new Date().toLocaleString("en-IN")
  });

  writeJSON("apexLoanApplications", loans);
  document.getElementById("emergencyLoanForm")?.reset();
  showModal("Emergency Loan Submitted", "Your emergency loan request up to ₹20,000 has been submitted for demo review.", "✓");
}

function getUserLoans(user) {
  if (!user) return [];

  const loans = readJSON("apexLoanApplications", []);
  return loans.filter(loan =>
    (user.accountNumber && loan.accountNumber === user.accountNumber) ||
    (user.email && loan.email === user.email)
  );
}

/* ---------------- Admin ---------------- */

function adminLogin(event) {
  event.preventDefault();

  const username = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPassword").value;

  if (username === "admin" && password === "Admin@123") {
    localStorage.setItem("apexAdminLoggedIn", "true");
    showAdminPanel();
    return;
  }

  showModal("Admin Login Failed", "Invalid admin username or password.", "!");
}

function showAdminPanel() {
  const loginPanel = document.getElementById("adminLoginPanel");
  const panel = document.getElementById("adminPanel");

  if (loginPanel) loginPanel.style.display = "none";
  if (panel) panel.style.display = "block";
  loadAdminData();
}

function adminLogout() {
  localStorage.removeItem("apexAdminLoggedIn");

  const panel = document.getElementById("adminPanel");
  const loginPanel = document.getElementById("adminLoginPanel");

  if (panel) panel.style.display = "none";
  if (loginPanel) loginPanel.style.display = "block";

  showModal("Admin Logged Out", "Admin session has been closed.", "✓");
}

function loadAdminData() {
  const users = readJSON("apexBankUsers", []);
  const loans = readJSON("apexLoanApplications", []);
  const kycs = readJSON("apexKYCApplications", []);
  const transfers = readJSON("apexCashTransfers", []);

  setText("adminUserCount", users.length);
  setText("adminAccountCount", users.filter(user => user.accountOpened).length);
  setText("adminKycCount", kycs.length);
  setText("adminTransferCount", transfers.length);
  setText("adminLoanCount", loans.length);
  setText("adminPendingLoans", loans.filter(loan => (loan.status || "Pending") === "Pending").length);

  const usersBody = document.getElementById("adminUsersBody");
  if (usersBody) {
    usersBody.innerHTML = "";
    users.forEach((user, index) => {
      const row = document.createElement("tr");
      [
        index + 1,
        user.accountNumber || "—",
        user.name || "—",
        user.accountType || "Not opened",
        user.cardType || "—",
        user.kycStatus || "Pending",
        user.email || "—",
        user.phone || "—",
        user.registeredAt || "—"
      ].forEach(value => appendCell(row, value));
      usersBody.appendChild(row);
    });
  }
  setDisplay("adminUsersEmpty", users.length ? "none" : "block");

  const kycBody = document.getElementById("adminKycBody");
  if (kycBody) {
    kycBody.innerHTML = "";
    kycs.forEach((kyc, index) => {
      const row = document.createElement("tr");
      [
        index + 1,
        kyc.accountNumber || "—",
        kyc.name || "—",
        kyc.documentType || "—",
        kyc.documentReference || "—",
        kyc.dob || "—",
        kyc.status || "Submitted",
        kyc.submittedAt || "—"
      ].forEach(value => appendCell(row, value));
      kycBody.appendChild(row);
    });
  }
  setDisplay("adminKycEmpty", kycs.length ? "none" : "block");

  const transfersBody = document.getElementById("adminTransfersBody");
  if (transfersBody) {
    transfersBody.innerHTML = "";
    transfers.forEach((transfer, index) => {
      const row = document.createElement("tr");
      [
        index + 1,
        transfer.senderName || "—",
        transfer.beneficiaryName || "—",
        transfer.transferMode || "—",
        "₹" + Number(transfer.amount || 0).toLocaleString("en-IN"),
        transfer.status || "Pending / Demo",
        transfer.transferredAt || "—"
      ].forEach(value => appendCell(row, value));
      transfersBody.appendChild(row);
    });
  }
  setDisplay("adminTransfersEmpty", transfers.length ? "none" : "block");

  const loansBody = document.getElementById("adminLoansBody");
  if (loansBody) {
    loansBody.innerHTML = "";

    loans.forEach((loan, index) => {
      const row = document.createElement("tr");
      [
        index + 1,
        loan.accountNumber || "—",
        loan.name || "—",
        loan.phone || "—",
        loan.loanType || "—",
        "₹" + Number(loan.amount || 0).toLocaleString("en-IN"),
        (loan.tenure || "—") + " months",
        loan.status || "Pending",
        loan.appliedAt || "—"
      ].forEach(value => appendCell(row, value));

      const actionCell = document.createElement("td");
      if ((loan.status || "Pending") === "Pending") {
        const approveButton = document.createElement("button");
        approveButton.className = "primary-btn admin-loan-action";
        approveButton.dataset.loanAction = "approve";
        approveButton.dataset.loanIndex = index;
        approveButton.textContent = "Approve";

        const rejectButton = document.createElement("button");
        rejectButton.className = "secondary-btn admin-loan-action";
        rejectButton.dataset.loanAction = "reject";
        rejectButton.dataset.loanIndex = index;
        rejectButton.textContent = "Reject";

        actionCell.append(approveButton, rejectButton);
      } else {
        actionCell.textContent = loan.status || "Processed";
      }

      row.appendChild(actionCell);
      loansBody.appendChild(row);
    });
  }
  setDisplay("adminLoansEmpty", loans.length ? "none" : "block");
}

function approveLoan(index) {
  const loans = readJSON("apexLoanApplications", []);
  const loan = loans[index];

  if (!loan) return;

  if ((loan.status || "Pending") !== "Pending") {
    showModal("Loan Already Processed", "This loan application has already been processed.", "!");
    return;
  }

  const users = readJSON("apexBankUsers", []);
  const userIndex = users.findIndex(user =>
    (loan.accountNumber && user.accountNumber === loan.accountNumber) ||
    (loan.email && user.email === loan.email)
  );

  if (userIndex === -1) {
    showModal("Approval Failed", "The applicant account could not be found.", "!");
    return;
  }

  const user = users[userIndex];

  if (!user.accountOpened) {
    showModal("Approval Failed", "The applicant has not opened a bank account yet.", "!");
    return;
  }

  ensureDemoBalance(user);
  const amount = Number(loan.amount || 0);

  if (!amount || amount <= 0) {
    showModal("Approval Failed", "Invalid loan amount.", "!");
    return;
  }

  user.balance = getBalance(user) + amount;
  loan.status = "Approved";
  loan.approvedAt = new Date().toLocaleString("en-IN");
  loan.approvedAmount = amount;
  loan.balanceAfter = user.balance;

  users[userIndex] = user;
  writeJSON("apexBankUsers", users);
  writeJSON("apexLoanApplications", loans);

  /* Refresh the logged-in user's stored data if this is that user. */
  if (localStorage.getItem("apexUserEmail") === user.email) {
    setCurrentUser(user);
  }

  addTransaction(user, {
    type: "Credit",
    description: `${loan.loanType || "Loan"} Approved`,
    amount,
    balanceAfter: user.balance,
    mode: "Loan Approval",
    reference: "LOAN-" + (loan.accountNumber || user.accountNumber || user.email)
  });

  showModal(
    "Loan Approved ✓",
    `₹${amount.toLocaleString("en-IN")} has been credited to ${user.name || "the customer"}'s account.`,
    "₹"
  );

  setTimeout(loadAdminData, 500);
}

function rejectLoan(index) {
  const loans = readJSON("apexLoanApplications", []);
  const loan = loans[index];

  if (!loan || (loan.status || "Pending") !== "Pending") return;

  loan.status = "Rejected";
  loan.rejectedAt = new Date().toLocaleString("en-IN");
  writeJSON("apexLoanApplications", loans);

  showModal("Loan Rejected", "The loan application has been marked as rejected.", "✕");
  setTimeout(loadAdminData, 500);
}

/* ---------------- EMI Calculator ---------------- */

function calculateEMI() {
  const amount = Number(document.getElementById("loanAmount")?.value || 0);
  const rate = Number(document.getElementById("interestRate")?.value || 0);
  const years = Number(document.getElementById("loanYears")?.value || 0);
  const months = years * 12;

  if (!amount || rate < 0 || !years) {
    showModal("EMI Calculator", "Please enter valid loan amount, interest rate and loan period.", "!");
    return;
  }

  const monthlyRate = rate / 12 / 100;
  const emi = monthlyRate === 0
    ? amount / months
    : (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

  const result = document.getElementById("emiResult");
  if (result) result.textContent = "Estimated monthly EMI: ₹" + emi.toFixed(2);

  showModal("Estimated EMI", "Your monthly EMI is ₹" + emi.toFixed(2), "₹");
}

function validateContact(event) {
  if (event) event.preventDefault();
  showModal("Message Sent", "Thank you. Your demo enquiry has been submitted.", "✓");
}

/* ---------------- Page Initializers ---------------- */

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setDisplay(id, value) {
  const element = document.getElementById(id);
  if (element) element.style.display = value;
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.appendChild(cell);
}

function removeAccountLinksIfOpened(user) {
  if (!user?.accountOpened) return;

  document.getElementById("accountNavItem")?.remove();
  document.getElementById("openAccountNav")?.remove();
  document.getElementById("manageAccountAction")?.remove();
  document.getElementById("openAccountAction")?.remove();
  document.getElementById("footerAccountLink")?.remove();
}

function initUserHome() {
  const user = requireUser();
  if (!user) return;

  ensureDemoBalance(user);

  setText("userHomeName", user.name || "Customer");
  setText("userHomeBalance", getBalance(user).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }));
  setText("userHomeAccount", user.accountNumber || "—");
  setText("userHomeAccountType", user.accountType || "Account type not selected");
  setText("userHomeKyc", user.kycStatus || "Pending");
  setText("userHomeCard", "Card: " + (user.cardType || "Not selected"));

  removeAccountLinksIfOpened(user);

  const loans = getUserLoans(user);
  const latest = loans.length ? loans[loans.length - 1] : null;
  const statusElement = document.getElementById("userLoanStatus");

  if (latest && statusElement) {
    const amount = Number(latest.amount || 0).toLocaleString("en-IN");
    statusElement.textContent = `Latest ${latest.loanType || "Loan"}: ₹${amount} — ${latest.status || "Pending"}${latest.approvedAt ? " • Approved " + latest.approvedAt : ""}`;
  }
}

function initDashboard() {
  const user = requireUser();
  if (!user) return;

  ensureDemoBalance(user);

  setText("dashName", user.name || "Customer");
  setText("accountName", user.name || "—");
  setText("accountEmail", user.email || "—");
  setText("accountNumber", user.accountNumber || "—");
  setText("balance", getBalance(user).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }));
  setText("accountTypeLabel", user.accountType || "Account type not selected");

  const status = document.getElementById("accountStatusBox");
  if (status) {
    if (user.accountOpened) {
      status.innerHTML = `<p><strong>${user.accountType}</strong> • ${user.accountStatus || "Active (Demo)"}</p><p>Card: <strong>${user.cardType || "Not selected"}</strong> &nbsp; | &nbsp; KYC: <strong>${user.kycStatus || "Pending"}</strong></p>`;
    } else {
      status.innerHTML = `<p><strong>Account not opened yet.</strong></p><p>Please choose Savings or Current Account and select your card.</p><a class="btn" href="account-opening.html">Open Account</a>`;
    }
  }

  removeAccountLinksIfOpened(user);

  const box = document.getElementById("recentTransactions");
  if (!box) return;

  const transactions = getTransactions(user).slice().reverse().slice(0, 5);
  if (!transactions.length) {
    box.innerHTML = "<p>No transactions recorded yet.</p>";
    return;
  }

  box.innerHTML = transactions.map(transaction => `
    <div class="transaction">
      <span>
        <strong>${transaction.description}</strong>
        <small>${transaction.date} • ${transaction.mode || "Banking"}</small>
      </span>
      <b class="${transaction.type === "Credit" ? "credit-text" : "debit-text"}">
        ${transaction.type === "Credit" ? "+" : "-"} ₹${Number(transaction.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </b>
    </div>
  `).join("");
}

function showDashboardPopup(title, message) {
  showModal(title, message, "✓");
}

function initStatement() {
  const user = requireUser();
  if (!user) return;

  ensureDemoBalance(user);

  setText("stName", user.name || "—");
  setText("stEmail", user.email || "—");
  setText("stAccount", user.accountNumber || "—");
  setText("stType", user.accountType || "Account type not selected");
  setText("stBalance", getBalance(user).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }));

  const transactions = getTransactions(user).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  setText("statementCount", `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`);

  const body = document.getElementById("statementBody");
  if (!body) return;

  if (!transactions.length) {
    setDisplay("statementEmpty", "block");
    return;
  }

  body.innerHTML = transactions.map(transaction => `
    <tr>
      <td>${transaction.date}</td>
      <td><strong>${transaction.description}</strong>${transaction.remarks ? `<br><small>${transaction.remarks}</small>` : ""}</td>
      <td>${transaction.mode || "—"}</td>
      <td>${transaction.reference || transaction.id || "—"}</td>
      <td class="credit-text">${transaction.type === "Credit" ? "+ ₹" + Number(transaction.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}</td>
      <td class="debit-text">${transaction.type === "Debit" ? "- ₹" + Number(transaction.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}</td>
      <td>₹${Number(transaction.balanceAfter || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join("");
}

function initInstantLoan() {
  const user = getCurrentUser();
  const loggedIn = localStorage.getItem("apexLoggedIn") === "true";

  if (user && loggedIn) {
    setText("loanName", user.name || "");
    setText("loanPhone", user.phone || "");
    const nameInput = document.getElementById("loanName");
    const phoneInput = document.getElementById("loanPhone");
    if (nameInput) nameInput.value = user.name || "";
    if (phoneInput) phoneInput.value = user.phone || "";
  }
}

function initAccountOpening() {
  const user = requireUser();
  if (!user) return;

  if (user.accountOpened) {
    showModal("Account Already Opened", "Your account is already active. The Open Account option has been removed from your user navigation.", "✓");
    setTimeout(() => window.location.href = "user-home.html", 700);
  }
}

function initAdmin() {
  if (localStorage.getItem("apexAdminLoggedIn") === "true") {
    showAdminPanel();
  }
}

/* ---------------- Single JavaScript Event System ---------------- */

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("bankModal");
  if (modal) modal.addEventListener("click", closeModalOnOverlay);

  const page = document.body?.dataset.page || "";

  if (page === "user-home") initUserHome();
  if (page === "dashboard") initDashboard();
  if (page === "statement") initStatement();
  if (page === "instant-loan") initInstantLoan();
  if (page === "account-opening") initAccountOpening();
  if (page === "admin") initAdmin();

  document.addEventListener("click", handleClickAction);
  document.addEventListener("submit", handleFormSubmit);
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeModal();
});

function handleClickAction(event) {
  const element = event.target.closest("[data-action], [data-nav], [data-loan-action]");
  if (!element) return;

  if (element.dataset.loanAction) {
    const index = Number(element.dataset.loanIndex);
    if (element.dataset.loanAction === "approve") approveLoan(index);
    if (element.dataset.loanAction === "reject") rejectLoan(index);
    return;
  }

  const action = element.dataset.action;
  const destination = element.dataset.nav;

  if (destination) {
    window.location.href = destination;
    return;
  }

  switch (action) {
    case "toggle-menu":
      toggleMenu();
      break;
    case "login-tab":
      showLogin();
      break;
    case "register-tab":
      showRegister();
      break;
    case "forgot-password":
      event.preventDefault();
      showForgotPassword();
      break;
    case "close-modal":
      closeModal();
      break;
    case "logout":
      logoutUser();
      break;
    case "admin-logout":
      adminLogout();
      break;
    case "admin-refresh":
      loadAdminData();
      break;
    case "calculate-emi":
      calculateEMI();
      break;
    case "print":
      window.print();
      break;
    case "dashboard-profile":
      showDashboardPopup("Profile", "Your profile is stored locally in this browser.");
      break;
  }
}

function handleFormSubmit(event) {
  const form = event.target;
  const action = form.dataset.formAction;
  if (!action) return;

  switch (action) {
    case "login":
      validateLogin(event);
      break;
    case "register":
      validateRegister(event);
      break;
    case "forgot-password":
      resetForgotPassword(event);
      break;
    case "account-opening":
      submitAccountOpening(event);
      break;
    case "admin-login":
      adminLogin(event);
      break;
    case "cash-transfer":
      submitCashTransfer(event);
      break;
    case "kyc":
      submitKYC(event);
      break;
    case "instant-loan":
      submitLoanApplication(event);
      break;
    case "emergency-loan":
      submitEmergencyLoan(event);
      break;
    case "contact":
      validateContact(event);
      break;
  }
}
