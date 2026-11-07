const API_URL = 'http://localhost:8000';

// 1. Load and display all books
async function fetchBooks() {
    const container = document.getElementById("books-container");
    if (!container) return; // If the container doesn't exist on the page, stop here

    try {
        const response = await fetch(`${API_URL}/books`);
        
        if (!response.ok) {
            throw new Error("Failed to load books from the server");
        }
        
        const books = await response.json();
        container.innerHTML = "";

        if (books.length === 0) {
            container.innerHTML = "<p>No books available yet.</p>";
            return;
        }

        books.forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";
            
            card.innerHTML = `
                <h3>${book.title}</h3>
                <p>${book.description || "No description available"}</p>
                <div class="price">${book.price} €</div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<p style="color: red;">Could not connect to the backend. Make sure Docker is running!</p>`;
    }
}

// 2. User Login & Token Storage
async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("login-username").value;
    const passwordInput = document.getElementById("login-password").value;

    const formData = new URLSearchParams();
    formData.append("username", usernameInput);
    formData.append("password", passwordInput);

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Save JWT token in browser storage
            localStorage.setItem("token", data.access_token);
            alert("Login successful!");
            window.location.href = "index.html"; // Return to home page
        } else {
            alert("Invalid username or password.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("An error occurred during login.");
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.status === 201) {
            alert("Account created! You can now log in.");
            window.location.href = "login.html";
            return;
        }

        const data = await response.json().catch(() => null);

        if (response.status >= 500) {
            alert("Server error. Please try again later.");
        } else if (typeof data?.detail === "string") {
            alert(data.detail);
        } else if (Array.isArray(data?.detail)) {
            alert(data.detail.map(error => error.msg).join("\n"));
        } else {
            alert("Registration failed. Please check your details.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Could not connect to the server.");
    } finally {
        submitButton.disabled = false;
    }
}

// 3. Add New Book (Using JWT Token)
async function handleAddBook(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must log in first to add a book!");
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("book-title").value;
    const description = document.getElementById("book-description").value;
    const price = parseFloat(document.getElementById("book-price").value);
    const state = document.getElementById("book-state").value;

    try {
        const response = await fetch(`${API_URL}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Send token for authentication
            },
           body: JSON.stringify({ title, description, price, state })
        });

        if (response.ok) {
            alert("Book added successfully! ");
            document.getElementById("add-book-form").reset();
            fetchBooks(); // Refresh book list
        } else {
            alert("Failed to add book. Please check your inputs.");
        }
    } catch (error) {
        console.error("Add Book Error:", error);
    }
}
async function estimateBookPrice(event) {
    const button = event.currentTarget;
    const output = document.getElementById("estimated-price");
    const originalPrice = document.getElementById("book-original-price").valueAsNumber;
    const years = document.getElementById("book-years").valueAsNumber;
    const condition = document.getElementById("book-state").value;

    if (!Number.isFinite(originalPrice) || originalPrice <= 0 ||
        !Number.isInteger(years) || years < 0) {
        output.textContent = "Enter a positive original price and an age in whole years.";
        return;
    }

    if (!["like_new", "good", "acceptable", "poor"].includes(condition)) {
        output.textContent = "Choose Like new, Good, Acceptable, or Poor for an estimate.";
        return;
    }

    button.disabled = true;
    output.textContent = "Estimating…";

    try {
        const response = await fetch(`${API_URL}/books/estimate-price`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ original_price: originalPrice, years, condition })
        });

        if (!response.ok) {
            throw new Error(`Estimate failed (${response.status})`);
        }

        const { estimated_price } = await response.json();
        output.textContent = `Suggested price: €${estimated_price.toFixed(2)}`;
    } catch {
        output.textContent = "Could not estimate the price. Please try again.";
    } finally {
        button.disabled = false;
    }
}



// Automatic execution based on the page the user is currently on
document.addEventListener("DOMContentLoaded", () => {
    fetchBooks();

    // Assign event listeners to forms if they exist on the current HTML page
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const addBookForm = document.getElementById("add-book-form");
    if (addBookForm) {
        addBookForm.addEventListener("submit", handleAddBook);
    }


    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);

    const showRegisterButton = document.getElementById("show-register");
const showLoginButton = document.getElementById("show-login");

if (loginForm && registerForm && showRegisterButton && showLoginButton) {
    const registerPrompt = document.getElementById("show-register-prompt");
    const loginPrompt = document.getElementById("show-login-prompt");

    function switchForm(showRegister) {
        loginForm.hidden = showRegister;
        registerForm.hidden = !showRegister;
        registerPrompt.hidden = showRegister;
        loginPrompt.hidden = !showRegister;

        const firstInput = showRegister
            ? registerForm.querySelector("input")
            : loginForm.querySelector("input");

        firstInput.focus();
    }

    showRegisterButton.addEventListener("click", () => switchForm(true));
    showLoginButton.addEventListener("click", () => switchForm(false));
}
const estimateButton = document.getElementById("estimate-price-btn");

if (estimateButton) {
    estimateButton.addEventListener("click", estimateBookPrice);
}


    
    }});