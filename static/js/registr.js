document
  .getElementById("avatar-input")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById("avatar-preview");
    const defaultIcon = preview.querySelector(".default-avatar");

    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        let img = preview.querySelector("img");
        if (!img) {
          img = document.createElement("img");
          preview.appendChild(img);
        }

        img.src = event.target.result;
        img.style.display = "block";
        if (defaultIcon) defaultIcon.style.display = "none";

        e.target.classList.add("has-file");
      };

      reader.readAsDataURL(file);
    } else {
      if (defaultIcon) defaultIcon.style.display = "block";
      const img = preview.querySelector("img");
      if (img) img.style.display = "none";
      e.target.classList.remove("has-file");
    }
  });
