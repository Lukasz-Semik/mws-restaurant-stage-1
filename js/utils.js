const dbPromise = idb.open('restaurants-db', 1, (upgradeDb) => {
  switch(upgradeDb.oldVersion) {
    case 0:
      const keyValStore = upgradeDb.createObjectStore('restaurants');
  }
});

fetchAllAndPrepareForDisplay = callback => {
  dbPromise.then(function(db) {
    var tx = db.transaction('restaurants');
    var restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.get('restaurantsCollection');
    }).then((restaurants) => {
      if (restaurants && restaurants.length > 0) {
        callback(restaurants);
      } else {
        fetch('http://localhost:1337/restaurants')
        .then(response => response.json())
        .then((data) => {
          dbPromise.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            restaurantsStore.put(data, 'restaurantsCollection')
            callback(data);
            return tx.complete;
          });
        })
        .catch((error) => console.log(error));
      }
    })
}

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, bigPicture) {
    if (!restaurant.photograph) return '';
    //1-236_small_1x
    const number = restaurant.photograph.charAt(0);
    if (bigPicture && window.innerWidth > 570) {
      return (`/img/${number}-650_large_1x.jpg`);
    }

    if (bigPicture) {
      return (`/img/${number}-370_medium_1x.jpg`);
    }

    return (`/img/${number}-236_small_1x.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    (marker);
    return marker;
  }

}

const btnVS = document.getElementById('view-switcher');
const mapContainer = document.getElementById('map-container');
let mapVisible = false;

const btnFilter = document.getElementById('view-switcher-filter');
const closeBtn = document.getElementById('filter-close');
const filterOptions = document.getElementById('filter-options');

btnVS.addEventListener('click', () => {
  if (!mapVisible) {
    mapContainer.classList.add('content__left--visible');
    mapVisible = true;
    btnVS.innerHTML = `
    <i class="fas fa-table fa-lg icon"></i>
    `;
  } else {
    mapContainer.classList.remove('content__left--visible');
    mapVisible = false;
    btnVS.innerHTML = `
    <i class="fas fa-map fa-lg icon"></i>
    `;
  }
})

if (btnFilter) {
  btnFilter.addEventListener('click', () => {
    filterOptions.classList.add('filter-options--expanded');
  })
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    filterOptions.classList.remove('filter-options--expanded');
  })
}
