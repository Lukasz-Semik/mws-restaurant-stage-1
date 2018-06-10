let restaurant;
var map;
const buttonLike = document.getElementById('btn-like');

// if (navigator.serviceWorker) {
//   navigator.serviceWorker.register('/sw.js')
//   .then(() => ('registered!'));
// };

/**
 * Initialize Google map, called from HTML.
 */

const initMap = (error, restaurant) => {
  if (error) { // Got an error!
    console.error(error);
  } else {
    const MAP = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    self.map = MAP;
    google.maps.event.addListener(MAP, "tilesloaded", function(){
      [].slice.apply(document.querySelectorAll('#map *')).forEach(function(item) { 
        item.setAttribute('tabindex','-1'); 
        });
      });
    fillBreadcrumb();
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
  }
}

window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => initMap(error, restaurant));
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    if (callback) callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    if (callback) callback(error, null);
  } else {
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      var restaurantsStore = tx.objectStore('restaurants');
        return restaurantsStore.get(`restaurant-${id}`);
      }).then((restaurant) => {
        if (restaurant) {
          self.restaurant = restaurant;
          fillRestaurantHTML();
          if (callback) callback(null, restaurant);
        } else {
          fetch(`http://localhost:1337/restaurants/${id}`)
            .then(response => response.json())
            .then(restaurant => {
              fetch(`http://localhost:1337/reviews/?restaurant_id=${getParameterByName('id')}`)
                .then((res) => res.json())
                .then(reviews => {
                  restaurant.reviews = reviews;

                  saveRestaurantInIndexedDb(restaurant, id, callback);
                });
            });
        }
      })
  }
}

const saveRestaurantInIndexedDb = (restaurant, id, callback) => dbPromise
  .then(db => {
    const tx = db.transaction('restaurants', 'readwrite');
    const restaurantsStore = tx.objectStore('restaurants');
    restaurantsStore.put(restaurant, `restaurant-${id}`)
    self.restaurant = restaurant;
    if (!restaurant) {
      console.error(error);
      return;
    }

    if (callback) {
      callback(null, restaurant)
      fillRestaurantHTML();
    };
    return tx.complete;
  });
// TODO something wrong db indexed db
const setButtonLikeClass = restaurant => {
  const favClass = 'btn-like--is-favourite';
  console.log('btn', Boolean(restaurant.is_favorite));
  if (restaurant.is_favorite === "true" || restaurant.is_favorite === true) { // there is some issue on backend -> it save the new value as a string, not as a bool.
    console.log('is true')
    buttonLike.classList.add('btn-like--is-favourite')
  } else {
    console.log('is-false')
    buttonLike.classList.remove('btn-like--is-favourite');
  }
}
// TODO!! something wrong db indexed db
buttonLike.addEventListener('click', () => {
  const fav = self.restaurant.is_favorite;

  self.restaurant.is_favorite = !fav;
  setButtonLikeClass(self.restaurant);
  fetch(`http://localhost:1337/restaurants/${self.restaurant.id}/?is_favorite=${!fav}`, {
    method: 'POST',
  })
  .then(() => {
    saveRestaurantInIndexedDb(self.restaurant, self.restaurant.id);
  })
});


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  setButtonLikeClass(restaurant);
  console.log(restaurant);
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.src = DBHelper.imageUrlForRestaurant(restaurant, true);
  image.alt = `An image from the restaurant ${restaurant.name}`

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.className = 'restaurant-detail__hours'
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

const prefixZero = value => (value < 10 ? `0${value}` : value);

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'restaurant-review__text'
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'restaurant-review__date'

  let time = new Date(review.updatedAt || review.createdAt);

  const parsedTime = `${time.getFullYear()}-${prefixZero(time.getMonth() + 1)}-${prefixZero(time.getDate())}`;

  date.innerHTML = parsedTime;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'restaurant-review__rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'restaurant-review__comment'
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.setAttribute('role', 'menubar')
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Form scripts
const form = document.forms['comment-form'];
const formButton = document.getElementById('form-button');
const nameInput = document.getElementById('userName');
const ratingInput = document.getElementById('rating');
const commentInput = document.getElementById('comment');

const INPUTS = [
  { name: 'nameInput', el: nameInput, error: 'name' },
  { name: 'ratingInput', el: ratingInput, error: 'rating' },
  { name: 'commentInput', el: commentInput, error: 'comment' },
];

const createComment = values => {
  return fetch('http://localhost:1337/reviews/', {
    body: JSON.stringify(values),
    method: 'POST',
    mode: 'cors',
  });
}

const showError = inputName => {
  document.getElementById(`error-${inputName}`).classList.add('error-msg--is-visible');
}

const hideError = inputName => {
  document.getElementById(`error-${inputName}`).classList.remove('error-msg--is-visible');
}

const validateInput = (value, inputName) => {
  if (!value || value.length < 3) {
    showError(inputName);
    return true;
  }
  return false;
}

const validateRating = rating => {
  console.log('validate rating', rating);
  if (!rating) {
    showError('rating');
    return true;
  }
  return false;
}

const validator = {
  nameInput: (value) => validateInput(value, 'name'),
  commentInput: (value) => validateInput(value, 'comment'),
  ratingInput: () => validateRating(form.rating.value),
};

INPUTS.forEach(input => {
  input.el.addEventListener('blur', (evnet) => validator[input.name](event.target.value));
  input.el.addEventListener('focus', () => {
    hideError(input.error);
    hideError('form');
  });
});

formButton.addEventListener('click', event => {
  event.preventDefault();

  const id = Number(getParameterByName('id'));

  const formState = {
    name: form.userName.value,
    rating: form.rating.value,
    comments: form.comment.value,
    restaurant_id: id,
  };

  const errors = [];
  if (validator.nameInput(formState.name)) {
    errors.push('name');
  }

  if (validator.commentInput(formState.comments)) {
    errors.push('comments');
  }

  if (validator.ratingInput()) {
    errors.push('rating');
  }

  const formIsInvalid = errors.length > 0;

  if (formIsInvalid) {
    showError('form');
    return;
  }

  createComment(formState)
    .then(res => res.json())
    .then(review => {
      const restaurant = self.restaurant;

      restaurant.reviews.push(review);

      return saveRestaurantInIndexedDb(restaurant, id)
        .then(() => {
          const reviewsList = document.getElementById('reviews-list');
          reviewsList.appendChild(createReviewHTML(review));
          reviewsList.lastChild.scrollIntoView({
            behavior: 'smooth',
          });
          form.userName.value = '';
          form.rating.value = '';
          form.comment.value = '';
        });
    });
});

document.getElementById('add-new-review').addEventListener('click', () => {
  document.getElementById('form').scrollIntoView({
    behavior: 'smooth',
  });
});
