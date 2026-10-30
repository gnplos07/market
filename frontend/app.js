const API_URL = "http://127.0.0.1:8000";

async function fetchBooks() {
    const container = document.getElementById("books-container");

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

document.addEventListener("DOMContentLoaded", fetchBooks);