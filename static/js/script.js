document.addEventListener("DOMContentLoaded", function() {
  console.log('DOM загружен, запускаем инициализацию...');
  
  // ... остальной код ...
  

document.addEventListener("DOMContentLoaded", function() {
  // Данные сервисов и отзывов
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
    // ... остальные сервисы
  ];

  const reviews = [
    {
      id: 1,
      serviceId: 1,
      author: "Иван Петров",
      rating: 5,
      date: "2023-05-15",
      text: "Отличный сервис! Быстро и качественно починили двигатель.",
    },
    // ... остальные отзывы
  ];

  // Инициализация приложения
  function init() {
    // Проверяем существование элементов перед работой с ними
    const servicesGrid = document.getElementById("servicesGrid");
    const reviewsContainer = document.getElementById("reviewsContainer");
    
    if (servicesGrid) renderServices(servicesGrid);
    if (reviewsContainer) renderReviews(reviewsContainer);
    
    setupEventListeners();
    initCustomSelects();
  }

  // Рендер сервисов
  function renderServices(container) {
    container.innerHTML = services.map(service => `
      <div class="service-card">
        <div class="service-header">
          <h3>${service.name}</h3>
          ${service.premium ? '<div class="premium-badge"><i class="fas fa-crown"></i> Premium</div>' : ''}
          <div class="service-rating">
            ${renderStars(service.rating)} ${service.rating}
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
      </div>
    `).join('');
  }

  // Рендер отзывов
  function renderReviews(container) {
    container.innerHTML = reviews.map(review => {
      const service = services.find(s => s.id === review.serviceId);
      return service ? `
        <div class="review-card">
          <div class="review-header">
            <div class="review-author">${review.author}</div>
            <div class="review-date">${formatDate(review.date)}</div>
          </div>
          <div class="review-service">О сервисе: ${service.name}</div>
          <div class="rating-stars">${renderStars(review.rating)}</div>
          <div class="review-text">${review.text}</div>
        </div>
      ` : '';
    }).join('');
  }

  // Рендер звезд рейтинга
  function renderStars(rating) {
    return Array(5).fill(0).map((_, i) => 
      i < Math.floor(rating) 
        ? '<i class="fas fa-star"></i>' 
        : i < rating 
          ? '<i class="fas fa-star-half-alt"></i>' 
          : '<i class="far fa-star"></i>'
    ).join('');
  }

  // Форматирование даты
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  }

  // Инициализация кастомных селектов
  function initCustomSelects() {
    // Функция инициализации одного кастомного селекта
    function initCustomSelect(selectWrapper) {
      // Получаем необходимые элементы
      const nativeSelect = selectWrapper.querySelector('.cc-native-select');
      const customTrigger = selectWrapper.querySelector('.cc-select-trigger');
      const optionsContainer = selectWrapper.querySelector('.cc-select-options');
      const options = selectWrapper.querySelectorAll('.cc-option');
      
      // Элемент для отображения выбранного значения
      const selectedValue = customTrigger.querySelector('.cc-selected-value');

      // Проверяем, все ли элементы существуют
      if (!nativeSelect || !customTrigger || !optionsContainer || !selectedValue) {
        console.error('Не найдены необходимые элементы для кастомного селекта', selectWrapper);
        return;
      }

      // Функция обновления отображаемого значения
      function updateDisplay() {
        const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
        selectedValue.textContent = selectedOption.textContent;
        
        // Обновляем класс selected для опций
        options.forEach(option => {
          const optionValue = option.getAttribute('data-value');
          option.classList.toggle('selected', optionValue === nativeSelect.value);
        });
      }

      // Обработчик клика по триггеру
      function handleTriggerClick(e) {
        e.stopPropagation();
        
        // Закрываем другие открытые селекты
        document.querySelectorAll('.cc-select-wrapper').forEach(wrapper => {
          if (wrapper !== selectWrapper) {
            wrapper.classList.remove('active');
            wrapper.querySelector('.cc-select-options').style.display = 'none';
          }
        });
        
        // Переключаем состояние текущего селекта
        selectWrapper.classList.toggle('active');
        optionsContainer.style.display = selectWrapper.classList.contains('active') ? 'block' : 'none';
      }

      // Обработчик выбора опции
      function handleOptionClick(option) {
        return function() {
          const value = option.getAttribute('data-value');
          nativeSelect.value = value;
          updateDisplay();
          selectWrapper.classList.remove('active');
          optionsContainer.style.display = 'none';
          
          // Инициируем событие изменения
          const changeEvent = new Event('change');
          nativeSelect.dispatchEvent(changeEvent);
        };
      }

      // Закрытие при клике вне селекта
      function handleOutsideClick(e) {
        if (!selectWrapper.contains(e.target)) {
          selectWrapper.classList.remove('active');
          optionsContainer.style.display = 'none';
        }
      }

      // Назначаем обработчики событий
      customTrigger.addEventListener('click', handleTriggerClick);
      
      options.forEach(option => {
        option.addEventListener('click', handleOptionClick(option));
      });
      
      document.addEventListener('click', handleOutsideClick);
      nativeSelect.addEventListener('change', updateDisplay);

      // Инициализируем начальное состояние
      updateDisplay();
    }

    // Инициализируем все кастомные селекты на странице
    const customSelects = document.querySelectorAll('.cc-select-wrapper');
    if (customSelects.length) {
      customSelects.forEach(initCustomSelect);
    } else {
      console.warn('На странице не найдены кастомные селекты');
    }
  }

  // Настройка обработчиков событий
  function setupEventListeners() {
    // Модальные окна
    document.querySelectorAll('[data-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
      });
    });

    document.querySelectorAll('.modal .close, .modal').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('close')) {
          e.currentTarget.closest('.modal').style.display = 'none';
        }
      });
    });

    // Рейтинг в форме отзыва
    const ratingStars = document.querySelectorAll('.rating-stars i');
    if (ratingStars.length) {
      ratingStars.forEach(star => {
        star.addEventListener('click', function() {
          const rating = parseInt(this.getAttribute('data-rating'));
          document.getElementById('reviewRating').value = rating;
          
          ratingStars.forEach((s, i) => {
            s.classList.toggle('fas', i < rating);
            s.classList.toggle('far', i >= rating);
          });
        });
      });
    }

    // Анимация футера
    const footerColumns = document.querySelectorAll('.footer-column');
    footerColumns.forEach((column, index) => {
      column.style.transition = `all 0.5s ease ${index * 0.2}s`;
      setTimeout(() => {
        column.style.opacity = '1';
        column.style.transform = 'translateY(0)';
      }, 100);
    });

    // Другие обработчики...
  }

  // Запуск приложения
  init(); // ВЫЗЫВАЕМ ЗДЕСЬ, ВНУТРИ ОБРАБОТЧИКА DOMContentLoaded

}); // Конец основного обработчика DOMContentLoaded

  init();
  console.log('Инициализация завершена');
});
