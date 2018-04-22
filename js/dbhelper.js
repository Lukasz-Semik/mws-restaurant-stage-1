/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
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
