//fetch api quotes
const article = document.querySelector("article");

const fetchedQoutes = () => {
  fetch("https://api.adviceslip.com/advice")
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      article.textContent = data.slip.advice;
    })
    .catch((err) => {
      console.error("error", err);
      article.textContent = "error";
    });
};

fetchedQoutes();

let input = document.querySelector("input");

input.addEventListener("click", () => {
  fetchedQoutes();
});
