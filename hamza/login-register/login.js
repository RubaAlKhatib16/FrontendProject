let registerUsers = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
let admin = {
  id: "3f1b2c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  username: "admin",
  email: "admin@gmail.com",
  password: "Admin-2003",
  role: "admin",
};
async function hashPassword(pwd) {
  const data = new TextEncoder().encode(pwd);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let form = document.querySelector("form");
let errorMsg = document.querySelector(".error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let email = document.querySelector("#email").value.trim();
  let password = document.querySelector("#password").value.trim();

  if (!email || !password) {
    errorMsg.textContent = "Please fill in all fields!";
    return;
  }

  if (email === admin.email && password == admin.password) {
    let adminHashed = {
      ...admin,
      password: await hashPassword(admin.password),
    };
    localStorage.setItem("currentuser", JSON.stringify(adminHashed));
    window.location.href = "../../mohammed/dashboardadmin.html";
  } else {
    let user = registerUsers.find((user) => user.email === email);

    if (user && user.password === (await hashPassword(password))) {
      localStorage.setItem("currentuser", JSON.stringify(user));

      if (user.age === "children") {
        window.location.href = "../../ruba/index.html";
      } else {
        window.location.href = "../../Raghad/youth.html";
      }

      form.reset();
    } else {
      errorMsg.textContent = "password or email is wrong!";
    }
  }
});

//toggle password
let passwordIcon = document.querySelector(".input-icon .fa-eye");
let hidePasswordIcon = document.querySelector(".input-icon .fa-eye-slash");
let passwordInput = document.querySelector("#password");

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
