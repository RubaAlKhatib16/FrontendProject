let form = document.querySelector("form");
let registerUsers = JSON.parse(localStorage.getItem("users")) || [];

async function hashPassword(pwd) {
  const data = new TextEncoder().encode(pwd);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.querySelector("#username").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();
  const age = document.querySelector("input[name='age']:checked")?.value;

  if (!username || !email || !password || !age) {
    alert("Please fill in all fields!");
    return;
  }

  if (!registerUsers.some((user) => user.email === email)) {
    registerUsers.push({
      id: crypto.randomUUID(),
      username: username,
      email: email,
      password: await hashPassword(password),
      age: age,
      role: "user",
    });
    localStorage.setItem("users", JSON.stringify(registerUsers));
    window.location.href = "./login.html";
    form.reset();
  } else {
    let errorMsg = document.querySelector(".error-msg");

    errorMsg.textContent = "Email is already exist!";
  }
});

//toggle password
const passwordIcon = document.querySelector(".input-icon .fa-eye");
const hidePasswordIcon = document.querySelector(".input-icon .fa-eye-slash");
const passwordInput = document.querySelector("#password");

hidePasswordIcon.addEventListener("click", () => {
  hidePasswordIcon.classList.add("hidden");
  passwordIcon.classList.remove("hidden");
  passwordInput.type = "text";
});

passwordIcon.addEventListener("click", () => {
  passwordIcon.classList.add("hidden");
  hidePasswordIcon.classList.remove("hidden");
  passwordInput.type = "password";
});


//regex

const usernameInput = document.querySelector("#username");
const emailInput = document.querySelector("#email");
const submitBtnInput = document.querySelector("#submitBtn");
const usernameErrorMsg = document.querySelector(".username-error-msg");
const emailErrorMsg = document.querySelector(".email-error-msg");
const passwordErrorMsg = document.querySelector(".password-error-msg");

const usernameRegex = /^(?=(.*[a-zA-Z].*){2,}).+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;

const checkAll = () => {
  const usernameValid = usernameRegex.test(usernameInput.value.trim());
  const emailValid = emailRegex.test(emailInput.value.trim());
  const passwordValid = passwordRegex.test(passwordInput.value.trim());

  if (usernameValid && emailValid && passwordValid) {
    submitBtnInput.disabled = false;
    // optional: make cursor normal
  } else {
    submitBtnInput.disabled = true;
    // optional: red "blocked" cursor
  }
};

usernameInput.addEventListener("input", () => {
  if (
    usernameRegex.test(usernameInput.value.trim()) ||
    !usernameInput.value.trim()
  ) {
    usernameErrorMsg.textContent = "";
  } else {
    usernameErrorMsg.textContent = "Username must contain at least 2 letters";
  }
  checkAll();
});

emailInput.addEventListener("input", () => {
  if (emailRegex.test(emailInput.value.trim()) || !emailInput.value.trim()) {
    emailErrorMsg.textContent = "";
  } else {
    emailErrorMsg.textContent = "Please enter a valid email";
  }
  checkAll();
});

passwordInput.addEventListener("input", () => {
  if (
    passwordRegex.test(passwordInput.value.trim()) ||
    !passwordInput.value.trim()
  ) {
    passwordErrorMsg.textContent = "";
  } else {
    passwordErrorMsg.textContent =
      "Password must be 6-20 chars, include uppercase, lowercase, number & special symbol[@,$,!,%,*,?,&]";
  }
  checkAll();
});
