const API_URL = "http://localhost:8080";
console.log("Script started");

function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPass").value;

    fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("signupResult").innerText = JSON.stringify(data, null, 2);
    });
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPass").value;
    const resultEl = document.getElementById("loginResult");

    try {
        const res = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        // store JWT for later API calls
        localStorage.setItem("jwt", data.token);

        resultEl.textContent = "Login successful! Redirecting...";

        // redirect to React dashboard (adjust path if needed)
        window.location.href = "/dashboard"; 
    } catch (err) {
        resultEl.textContent = err.message;
    }
}


function getInstances() {
    fetch(`${API_URL}/instances`, {
        headers: { "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjQ2NzM4NjEsInN1YiI6ImY0MGM1Y2ZhLWY2YTctNDI3ZS04Yzg0LTg0MGVkMjNkOTVlZCJ9.Cw4U76fah8TvKszdEgQ44T9SmutJFiYa1wrPpeMFmZ8" }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("profileResult").innerText = JSON.stringify(data, null, 2);
    });
}


