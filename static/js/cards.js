// Инициализация карты (Яндекс или Google)
function initMap() {
  // Для Яндекс.Карт
  if (typeof ymaps !== "undefined") {
    const map = new ymaps.Map("service-map", {
      center: [55.76, 37.64], // Москва
      zoom: 15,
      controls: ["zoomControl"],
    });

    // Добавляем метку
    const placemark = new ymaps.Placemark([55.76, 37.64], {
      hintContent: 'Автосервис "МоторМастер"',
      balloonContent: "ул. Автозаводская, 23к1",
    });

    map.geoObjects.add(placemark);
  }
  // Для Google Maps
  else if (typeof google !== "undefined") {
    const map = new google.maps.Map(document.getElementById("service-map"), {
      center: { lat: 55.76, lng: 37.64 },
      zoom: 15,
    });

    new google.maps.Marker({
      position: { lat: 55.76, lng: 37.64 },
      map: map,
      title: 'Автосервис "МоторМастер"',
    });
  }
}

// Подключаем API карт
function loadMapAPI() {
  // Для Яндекс.Карт
  const yandexScript = document.createElement("script");
  yandexScript.src =
    "https://api-maps.yandex.ru/2.1/?apikey=6686afb6-6b41-44f3-882d-ba4443b1da73&lang=ru_RU";
  yandexScript.onload = initMap;
  document.head.appendChild(yandexScript);

  // Или для Google Maps
  /*
  const googleScript = document.createElement('script');
  googleScript.src = 'https://maps.googleapis.com/maps/api/js?key=ВАШ_API_КЛЮЧ&callback=initMap';
  document.head.appendChild(googleScript);
  */
}

// Загружаем API при открытии страницы
window.addEventListener("DOMContentLoaded", loadMapAPI);
