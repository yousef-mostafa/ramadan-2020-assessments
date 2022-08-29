let isAdmin = false;
if (!localStorage.length) {
    window.location.replace("http://127.0.0.1:5500/login.html")
}
else if (localStorage.getItem("email") === "y1182001@gmail.com" && localStorage.getItem("name") === "admin") {
    isAdmin = true
}

export {isAdmin}