const API_URL = "http://localhost:8000";

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

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPass").value;

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        localStorage.setItem("token", data.access_token);
        document.getElementById("loginResult").innerText = JSON.stringify(data, null, 2);
    });
}

function getProfile() {
    fetch(`${API_URL}/instances`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("profileResult").innerText = JSON.stringify(data, null, 2);
    });
}


