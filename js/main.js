let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();

  // if (!navigator.serviceWorker) return;
  // navigator.serviceWorker.register('/sw.js')
  //   .then(() => ('registered!'));
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  fetch('http://localhost:1337/restaurants')
  .then(resoponse => response.json())
  .then((data) => {
    console.log(data);
    self.neighborhoods = data
      .map((v, i) => data[i].neighborhood)
      .filter((v, i, self) => self.indexOf(v) == i);
    fillNeighborhoodsHTML();
  })
  .catch(() => console.log('something went wrong'));
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  fetch('http://localhost:1337/restaurants')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const cuisines = data.map((v, i) => data[i].cuisine_type)
    const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
    self.cuisines = cuisines;
    fillCuisinesHTML();
  })
  .catch(() => console.log('something went wrong'))
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  const MAP = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  self.map = MAP;
  google.maps.event.addListener(MAP, "tilesloaded", function(){
    [].slice.apply(document.querySelectorAll('#map *')).forEach(function(item) { 
      item.setAttribute('tabindex','-1'); 
      });
    });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  fetch('http://localhost:1337/restaurants')
  .then(response => response.json())
  .then(restaurants => {
    let results = restaurants;
      if (cuisine != 'all') { // filter by cuisine
        results = restaurants.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = restaurants.filter(r => r.neighborhood == neighborhood);
      }
      resetRestaurants(results);
      fillRestaurantsHTML();
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'restaurants__list-item'

  const image = document.createElement('img');
  image.className = 'restaurants__img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `An image from the restaurant ${restaurant.name}`
  li.append(image);

  const name = document.createElement('h2');
  name.className='restaurants__title'
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.className = 'restaurants__text'
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.className = 'restaurants__text restaurants__text--small'
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.className = 'btn';
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });

    self.markers.push(marker);
  });
}

