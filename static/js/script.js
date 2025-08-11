document.addEventListener("DOMContentLoaded", function () {
  const services = [
    {
      id: 1,
      name: "AirBarter",
      category: "engine",
      rating: 4.9,
      address: "Мебельный проезд, 2",
      services: "Ремонт пневмоподвесок, диагностика",
      price: "от 5 000 ₽",
      premium: true,
    },
    {
      id: 2,
      name: "Элит Кузов",
      category: "body",
      rating: 4.7,
      address: "пр. Металлистов, 22",
      services: "Покраска, рихтовка, полировка",
      price: "от 3 000 ₽",
      premium: false,
    },
    {
      id: 3,
      name: "Люкс Ходовая",
      category: "suspension",
      rating: 4.8,
      address: "ш. Дорожное, 8",
      services: "Замена амортизаторов, ремонт подвески",
      price: "от 4 500 ₽",
      premium: true,
    },
    {
      id: 4,
      name: "Авто Электрик",
      category: "electric",
      rating: 4.5,
      address: "ул. Токарная, 5",
      services: "Диагностика, ремонт проводки, установка оборудования",
      price: "от 2 500 ₽",
      premium: false,
    },
  ];

  const reviews = [
    {
      id: 1,
      serviceId: 1,
      author: "Иван Петров",
      rating: 5,
      date: "2023-05-15",
      text: "Отличный сервис! Быстро и качественно починили двигатель. Персонал вежливый, цены адекватные. Рекомендую!",
    },
    {
      id: 2,
      serviceId: 2,
      author: "Алексей Смирнов",
      rating: 4,
      date: "2023-06-02",
      text: "Сделали покраску бампера. Качество хорошее, но пришлось подождать дольше обещанного срока.",
    },
    {
      id: 3,
      serviceId: 3,
      author: "Мария Иванова",
      rating: 5,
      date: "2023-06-10",
      text: "Отремонтировали подвеску за один день. Все объяснили, дали гарантию. Очень довольна!",
    },
  ];

  const servicesGrid = document.getElementById("servicesGrid");
  const reviewsContainer = document.getElementById("reviewsContainer");
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");
  const openPremiumModalBtn = document.getElementById("openPremiumModal");
  const addReviewBtn = document.createElement("button");
  const loginModal = document.getElementById("loginModal");
  const premiumModal = document.getElementById("premiumModal");
  const reviewModal = document.getElementById("reviewModal");
  const closeButtons = document.querySelectorAll(".close");
  const serviceSelect = document.getElementById("serviceSelect");
  const ratingStars = document.querySelectorAll(".rating-stars i");
  const reviewRatingInput = document.getElementById("reviewRating");
  const reviewForm = document.getElementById("reviewForm");

  let currentUser = null;

  function init() {
    const logo = document.querySelector(".logo");
    if (logo) {
      logo.addEventListener("mouseenter", () => {
        logo.style.animationDuration = "4s";
      });

      logo.addEventListener("mouseleave", () => {
        logo.style.animationDuration = "8s";
      });
    }
    renderServices();
    renderReviews();
    setupEventListeners();
  }

  function renderServices() {
    servicesGrid.innerHTML = "";

    services.forEach((service) => {
      const card = document.createElement("div");
      card.className = "service-card";

      const premiumBadge = service.premium
        ? '<div class="premium-badge"><i class="fas fa-crown"></i> Premium</div>'
        : "";

      const stars = Array(5)
        .fill(0)
        .map((_, i) =>
          i < Math.floor(service.rating)
            ? '<i class="fas fa-star"></i>'
            : i < service.rating
            ? '<i class="fas fa-star-half-alt"></i>'
            : '<i class="far fa-star"></i>'
        )
        .join("");

      card.innerHTML = `
                <div class="service-header">
                    <h3>${service.name}</h3>
                    ${premiumBadge}
                    <div class="service-rating">
                        ${stars} ${service.rating}
                    </div>
                </div>
                <div class="service-body">
                    <p><strong>Услуги:</strong> ${service.services}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${service.address}</p>
                    <p><strong>Цены:</strong> ${service.price}</p>
                </div>
                <div class="service-footer">
                    <button class="btn btn-outline btn-view-reviews">
                        <i class="fas fa-comment-alt"></i> Отзывы
                    </button>
                    <button class="btn btn-primary">
                        <i class="fas fa-phone-alt"></i> Позвонить
                    </button>
                </div>
            `;

      servicesGrid.appendChild(card);
    });

    addReviewBtn.className = "btn btn-primary";
    addReviewBtn.innerHTML = '<i class="fas fa-edit"></i> Оставить отзыв';
    addReviewBtn.id = "openReviewModal";
    servicesSection.appendChild(addReviewBtn);
  }

  function renderReviews() {
    reviewsContainer.innerHTML = "";

    reviews.forEach((review) => {
      const service = services.find((s) => s.id === review.serviceId);
      if (!service) return;

      const reviewCard = document.createElement("div");
      reviewCard.className = "review-card";

      const stars = Array(5)
        .fill(0)
        .map((_, i) =>
          i < review.rating
            ? '<i class="fas fa-star"></i>'
            : '<i class="far fa-star"></i>'
        )
        .join("");

      reviewCard.innerHTML = `
                <div class="review-header">
                    <div class="review-author">${review.author}</div>
                    <div class="review-date">${formatDate(review.date)}</div>
                </div>
                <div class="review-service">О сервисе: ${service.name}</div>
                <div class="rating-stars">${stars}</div>
                <div class="review-text">${review.text}</div>
            `;

      reviewsContainer.appendChild(reviewCard);
    });
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  }

  function setupEventListeners() {
    loginBtn.addEventListener("click", () => {
      loginModal.style.display = "block";
    });

    registerBtn.addEventListener("click", () => {
      alert("Функция регистрации в разработке");
    });

    openPremiumModalBtn.addEventListener("click", () => {
      premiumModal.style.display = "block";
    });

    addReviewBtn.addEventListener("click", () => {
      serviceSelect.innerHTML =
        '<option value="">-- Выберите сервис --</option>';
      services.forEach((service) => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
      });

      reviewModal.style.display = "block";
    });

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        this.closest(".modal").style.display = "none";
      });
    });

    window.addEventListener("click", function (e) {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });

    ratingStars.forEach((star) => {
      star.addEventListener("click", function () {
        const rating = parseInt(this.getAttribute("data-rating"));
        reviewRatingInput.value = rating;

        ratingStars.forEach((s, i) => {
          if (i < rating) {
            s.classList.remove("far");
            s.classList.add("fas");
          } else {
            s.classList.remove("fas");
            s.classList.add("far");
          }
        });
      });
    });

    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const serviceId = parseInt(serviceSelect.value);
      const author = document.getElementById("reviewName").value;
      const rating = parseInt(reviewRatingInput.value);
      const text = document.getElementById("reviewText").value;

      if (!serviceId || !author || !rating || !text) {
        alert("Пожалуйста, заполните все поля");
        return;
      }

      const newReview = {
        id: reviews.length + 1,
        serviceId,
        author,
        rating,
        date: new Date().toISOString().split("T")[0],
        text,
      };

      reviews.push(newReview);
      renderReviews();
      reviewModal.style.display = "none";
      reviewForm.reset();

      ratingStars.forEach((star) => {
        star.classList.remove("fas");
        star.classList.add("far");
      });
      reviewRatingInput.value = "0";

      alert("Спасибо за ваш отзыв!");
    });
  }

  init();
});

const subscribeBtn = document.querySelector(".btn-subscribe");
if (subscribeBtn) {
  subscribeBtn.addEventListener("mouseenter", () => {
    subscribeBtn.innerHTML =
      '<span>Подписаться</span><i class="fas fa-arrow-right"></i>';
  });

  subscribeBtn.addEventListener("mouseleave", () => {
    subscribeBtn.innerHTML =
      '<span>Подписаться</span><i class="fas fa-arrow-right"></i>';
  });
}

const footerColumns = document.querySelectorAll(".footer-column");
footerColumns.forEach((column, index) => {
  column.style.opacity = "0";
  column.style.transform = "translateY(20px)";
  column.style.transition = `all 0.5s ease ${index * 0.2}s`;

  setTimeout(() => {
    column.style.opacity = "1";
    column.style.transform = "translateY(0)";
  }, 100);
});

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    window.scrollTo({
      top: section.offsetTop,
      behavior: "smooth",
    });
  }
}

const btnBtnHero = document.getElementById("btn-hero");

btnBtnHero.addEventListener("click", () => {});

document
  .getElementById("register-button")
  ?.addEventListener("click", function () {
    fetch("registr.html")
      .then((response) => {
        if (response.ok) {
          window.location.href = "registr.html";
        } else {
          console.error("Страница регистрации не найдена");

          alert("Страница регистрации временно недоступна");
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при переходе");
      });
  });

document.addEventListener('DOMContentLoaded', function() {
  const select = document.querySelector('.custom-select');
  const styledSelect = select.querySelector('.select-styled');
  const options = select.querySelectorAll('.select-options li');
  const hiddenSelect = select.querySelector('select');
  
  // Установка начального текста
  styledSelect.textContent = hiddenSelect.options[hiddenSelect.selectedIndex].text;
  
  // Обработчик клика на стилизованный select
  styledSelect.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = this.classList.toggle('active');
    select.querySelector('.select-options').classList.toggle('show', isActive);
    
    // Закрытие других открытых select'ов
    document.querySelectorAll('.custom-select .select-styled').forEach(el => {
      if (el !== this) {
        el.classList.remove('active');
        el.nextElementSibling.classList.remove('show');
      }
    });
  });
  
  // Обработчик выбора опции
  options.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      const value = this.getAttribute('data-value');
      
      // Обновление скрытого select
      hiddenSelect.value = value;
      
      // Обновление стилизованного отображения
      styledSelect.textContent = this.textContent;
      styledSelect.classList.remove('active');
      
      // Помечаем выбранный элемент
      options.forEach(opt => opt.removeAttribute('data-selected'));
      this.setAttribute('data-selected', 'true');
      
      // Скрываем options
      select.querySelector('.select-options').classList.remove('show');
    });
  });
  
  // Закрытие при клике вне
  document.addEventListener('click', function() {
    styledSelect.classList.remove('active');
    select.querySelector('.select-options').classList.remove('show');
  });
});
