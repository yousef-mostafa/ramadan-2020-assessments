function isEmpty(field) {
	if (field.value === "") {
		field.classList.add("is-invalid");
		return false;
	}
	else {
		field.classList.remove("is-invalid");
		return true;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	let formSingUp = document.querySelector("#signUp");
	formSingUp.addEventListener("submit", (e) => {
    let dataForm = new FormData(formSingUp);
		e.preventDefault();
		let input_text = formSingUp.querySelector("input[type=text]");
		let input_email = formSingUp.querySelector("input[type = email]");

		// clint-side validation
		let validationArray = []
		validationArray.push(isEmpty(input_text));
		validationArray.push(isEmpty(input_email));

		// special validation for email
		if (isEmpty(input_email)) {
			let feedback_email = formSingUp.querySelector("input[type = email] + div");
			if (!input_email.value.includes("@") || !input_email.value.includes(".com")) {
				input_email.classList.add("is-invalid");
				feedback_email.innerHTML = "your email is not valid, please try again with correct email!"
				validationArray.push(false);
			}
			else {
				input_email.classList.remove("is-invalid");
				feedback_email.innerHTML = "please enter your email!"
				validationArray.push(true);
			}
		}

		// * to remove invalid massage on fill 
		let allInvalidEle = formSingUp.querySelectorAll(".is-invalid");
		if (allInvalidEle.length) {
			allInvalidEle.forEach(element => {
				element.addEventListener("input", function () {
					this.classList.remove("is-invalid")
				});
				return;
			})
		}

		// check total validation 
		if (validationArray.every(item => item === true)) {
      fetch("http://localhost:7777/users/login", {
				method: "POST",
        body: dataForm ,
			}).then(() => {
        localStorage.setItem("name", input_text.value);
        localStorage.setItem("email", input_email.value);
        window.location.replace("http://127.0.0.1:5500/index.html")
			});
		}
	})
})