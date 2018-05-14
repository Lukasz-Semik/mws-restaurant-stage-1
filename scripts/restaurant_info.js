let restaurant;var map;navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(()=>"registered!");window.initMap=()=>{fetchRestaurantFromURL((a,b)=>{if(a)console.error(a);else{const a=new google.maps.Map(document.getElementById("map"),{zoom:16,center:b.latlng,scrollwheel:!1});self.map=a,google.maps.event.addListener(a,"tilesloaded",function(){[].slice.apply(document.querySelectorAll("#map *")).forEach(function(a){a.setAttribute("tabindex","-1")})}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map)}})},fetchRestaurantFromURL=a=>{if(self.restaurant)return void a(null,self.restaurant);const b=getParameterByName("id");b?dbPromise.then(function(a){var c=a.transaction("restaurants"),d=c.objectStore("restaurants");return d.get(`restaurant-${b}`)}).then(c=>{c?(self.restaurant=c,fillRestaurantHTML(),a(null,c)):fetch(`http://localhost:1337/restaurants/${b}`).then(a=>a.json()).then(c=>{dbPromise.then(d=>{const e=d.transaction("restaurants","readwrite"),f=e.objectStore("restaurants");return(f.put(c,`restaurant-${b}`),self.restaurant=c,!c)?void console.error(error):(fillRestaurantHTML(),a(null,c),e.complete)})})}):(error="No restaurant id in URL",a(error,null))},fillRestaurantHTML=(a=self.restaurant)=>{const b=document.getElementById("restaurant-name");b.innerHTML=a.name;const c=document.getElementById("restaurant-address");c.innerHTML=a.address;const d=document.getElementById("restaurant-img");d.src=DBHelper.imageUrlForRestaurant(a,!0),d.alt=`An image from the restaurant ${a.name}`;const e=document.getElementById("restaurant-cuisine");e.innerHTML=a.cuisine_type,a.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()},fillRestaurantHoursHTML=(a=self.restaurant.operating_hours)=>{const b=document.getElementById("restaurant-hours");for(let c in b.className="restaurant-detail__hours",a){const d=document.createElement("tr"),e=document.createElement("td");e.innerHTML=c,d.appendChild(e);const f=document.createElement("td");f.innerHTML=a[c],d.appendChild(f),b.appendChild(d)}},fillReviewsHTML=(a=self.restaurant.reviews)=>{const b=document.getElementById("reviews-container"),c=document.createElement("h2");if(c.className="restaurant-review__title",c.innerHTML="Reviews",b.appendChild(c),!a){const a=document.createElement("p");return a.innerHTML="No reviews yet!",void b.appendChild(a)}const d=document.getElementById("reviews-list");a.forEach(a=>{d.appendChild(createReviewHTML(a))}),b.appendChild(d)},createReviewHTML=a=>{const b=document.createElement("li"),c=document.createElement("p");c.className="restaurant-review__text",c.innerHTML=a.name,b.appendChild(c);const d=document.createElement("p");d.className="restaurant-review__date",d.innerHTML=a.date,b.appendChild(d);const e=document.createElement("p");e.className="restaurant-review__rating",e.innerHTML=`Rating: ${a.rating}`,b.appendChild(e);const f=document.createElement("p");return f.className="restaurant-review__comment",f.innerHTML=a.comments,b.appendChild(f),b},fillBreadcrumb=(a=self.restaurant)=>{const b=document.getElementById("breadcrumb");b.setAttribute("role","menubar");const c=document.createElement("li");c.innerHTML=a.name,b.appendChild(c)},getParameterByName=(a,b)=>{b||(b=window.location.href),a=a.replace(/[\[\]]/g,"\\$&");const c=new RegExp(`[?&]${a}(=([^&#]*)|&|#|$)`),d=c.exec(b);return d?d[2]?decodeURIComponent(d[2].replace(/\+/g," ")):"":null};