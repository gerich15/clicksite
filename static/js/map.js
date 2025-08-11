class YandexMap {
  constructor() {
    this.map = null;
    this.mapInitialized = false;
    this.mapVisible = false;
    this.markers = [];

    this.DOM = {
      container: document.getElementById("map-container"),
      mapElement: document.getElementById("map"),
      showBtn: document.getElementById("show-map"),
      closeBtn: document.getElementById("close-map"),
    };

    this.init();
  }

  init() {
    if (!this.DOM.showBtn || !this.DOM.container) return;

    this.setupEventListeners();
    this.checkAPI();
  }

  setupEventListeners() {
    this.DOM.showBtn.addEventListener("click", () => this.toggleMap());
    this.DOM.closeBtn?.addEventListener("click", () => this.hideMap());
  }

  checkAPI() {
    if (!window.ymaps) {
      console.error("Yandex Maps API not loaded");
      return;
    }
  }

  async initMap() {
    if (this.mapInitialized) return true;

    try {
      await ymaps.ready();

      this.map = new ymaps.Map(this.DOM.mapElement, {
        center: [55.751244, 37.618423],
        zoom: 12,
        controls: ["zoomControl", "typeSelector"],
      });

      this.addDefaultMarkers();
      this.mapInitialized = true;
      return true;
    } catch (error) {
      console.error("Map initialization failed:", error);
      return false;
    }
  }

  addDefaultMarkers() {
    const serviceData = [
      {
        coords: [55.751244, 37.618423],
        properties: {
          hintContent: "Автосервис Премиум",
          balloonContent: "Москва, ул. Ленина, 42",
        },
      },
      {
        coords: [55.761244, 37.628423],
        properties: {
          hintContent: "Техцентр Быстро",
          balloonContent: "Москва, ул. Пушкина, 15",
        },
      },
    ];

    serviceData.forEach((service) => {
      const placemark = new ymaps.Placemark(
        service.coords,
        service.properties,
        { preset: "islands#blueAutoCircleIcon" }
      );
      this.map.geoObjects.add(placemark);
      this.markers.push(placemark);
    });
  }

  async toggleMap() {
    if (this.mapVisible) {
      this.hideMap();
    } else {
      await this.showMap();
    }
  }

  async showMap() {
    if (!this.mapInitialized) {
      const success = await this.initMap();
      if (!success) return;
    }

    this.DOM.container.classList.add("map-visible");
    this.mapVisible = true;

    setTimeout(() => {
      if (this.map) {
        this.map.container.fitToViewport();
      }
    }, 300);
  }

  hideMap() {
    this.DOM.container.classList.remove("map-visible");
    this.mapVisible = false;
  }

  addMarker(coords, properties) {
    if (!this.mapInitialized) return null;

    const placemark = new ymaps.Placemark(coords, properties, {
      preset: "islands#blueAutoCircleIcon",
    });

    this.map.geoObjects.add(placemark);
    this.markers.push(placemark);
    return placemark;
  }

  removeAllMarkers() {
    this.map.geoObjects.removeAll();
    this.markers = [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.yandexMap = new YandexMap();
});
