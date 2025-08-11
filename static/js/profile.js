document.addEventListener("DOMContentLoaded", function () {
  // Анимация загрузки
  setTimeout(() => {
    document.body.style.opacity = 1;
  }, 100);

  // Переключение вкладок объявлений
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Удаляем активный класс у всех вкладок
      tabs.forEach((t) => t.classList.remove("active"));
      // Добавляем активный класс текущей вкладке
      this.classList.add("active");

      // Получаем тип вкладки
      const tabType = this.getAttribute("data-tab");

      // Скрываем все объявления
      document.querySelectorAll(".ad-card").forEach((card) => {
        card.style.display = "none";
      });

      // Показываем только нужные
      document
        .querySelectorAll(`.ad-card[data-tab="${tabType}"]`)
        .forEach((card) => {
          card.style.display = "block";
          card.style.animation = "fadeIn 0.5s ease-out";
        });
    });
  });

  // Редактирование профиля
  const editBtn = document.getElementById("edit-profile-btn");
  const cancelBtn = document.getElementById("cancel-edit");
  const editForm = document.getElementById("edit-form");

  editBtn.addEventListener("click", function () {
    editForm.style.display = "block";
    editForm.scrollIntoView({ behavior: "smooth" });
  });

  cancelBtn.addEventListener("click", function () {
    editForm.style.display = "none";
  });

  // Загрузка аватарки
  const avatarUpload = document.getElementById("avatar-upload");
  const avatarPreview = document.getElementById("avatar-preview");

  avatarUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        avatarPreview.src = event.target.result;

        // Анимация подтверждения загрузки
        avatarPreview.style.animation = "pulse 0.6s ease";
        setTimeout(() => {
          avatarPreview.style.animation = "";
        }, 600);
      };
      reader.readAsDataURL(file);
    }
  });

  // Можно добавить AJAX для сохранения формы
  document
    .getElementById("profile-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Здесь будет код отправки формы
      alert("Изменения сохранены!");
      editForm.style.display = "none";
    });

  // Анимация карточек при наведении
  const cards = document.querySelectorAll(".stat-card, .ad-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
    });
  });
});
