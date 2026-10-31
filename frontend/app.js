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
            alert("Login successful! 🎉");
            window.location.href = "index.html"; // Return to home page
        } else {
            alert("Invalid username or password.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("An error occurred during login.");
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

    try {
        const response = await fetch(`${API_URL}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Send token for authentication
            },
            body: JSON.stringify({ title, description, price })
        });

        if (response.ok) {
            alert("Book added successfully! 📚");
            document.getElementById("add-book-form").reset();
            fetchBooks(); // Refresh book list
        } else {
            alert("Failed to add book. Please check your inputs.");
        }
    } catch (error) {
        console.error("Add Book Error:", error);
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
});