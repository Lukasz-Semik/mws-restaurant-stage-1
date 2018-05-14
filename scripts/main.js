let restaurants,neighborhoods,cuisines;var map,markers=[];document.addEventListener("DOMContentLoaded",()=>{fetchNeighborhoods(),fetchCuisines();navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(()=>"registered!")}),fetchNeighborhoods=()=>{fetchAllAndPrepareForDisplay(a=>{console.log("data",a),self.neighborhoods=a.map((b,c)=>a[c].neighborhood).filter((a,b,c)=>c.indexOf(a)==b),fillNeighborhoodsHTML()})},fillNeighborhoodsHTML=(a=self.neighborhoods)=>{const b=document.getElementById("neighborhoods-select");a.forEach(a=>{const c=document.createElement("option");c.innerHTML=a,c.value=a,b.append(c)})},fetchCuisines=()=>{fetchAllAndPrepareForDisplay(a=>{const b=a.map((b,c)=>a[c].cuisine_type),c=b.filter((a,c)=>b.indexOf(a)==c);self.cuisines=b,fillCuisinesHTML()})},fillCuisinesHTML=(a=self.cuisines)=>{const b=document.getElementById("cuisines-select");a.forEach(a=>{const c=document.createElement("option");c.innerHTML=a,c.value=a,b.append(c)})},window.initMap=()=>{const a=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1});self.map=a,google.maps.event.addListener(a,"tilesloaded",function(){[].slice.apply(document.querySelectorAll("#map *")).forEach(function(a){a.setAttribute("tabindex","-1")})}),updateRestaurants()},updateRestaurants=()=>{const a=document.getElementById("cuisines-select"),b=document.getElementById("neighborhoods-select"),c=a.selectedIndex,d=b.selectedIndex,e=a[c].value,f=b[d].value;fetchAllAndPrepareForDisplay(a=>{let b=a;"all"!=e&&(b=a.filter(a=>a.cuisine_type==e)),"all"!=f&&(b=a.filter(a=>a.neighborhood==f)),resetRestaurants(b),fillRestaurantsHTML()})},resetRestaurants=a=>{self.restaurants=[];const b=document.getElementById("restaurants-list");b.innerHTML="",self.markers.forEach(a=>a.setMap(null)),self.markers=[],self.restaurants=a},fillRestaurantsHTML=(a=self.restaurants)=>{const b=document.getElementById("restaurants-list");a.forEach(a=>{b.append(createRestaurantHTML(a))}),addMarkersToMap()},createRestaurantHTML=a=>{const b=document.createElement("li");b.className="restaurants__list-item";const c=document.createElement("img");c.className="restaurants__img",c.src=DBHelper.imageUrlForRestaurant(a),c.alt=`An image from the restaurant ${a.name}`,b.append(c);const d=document.createElement("h2");d.className="restaurants__title",d.innerHTML=a.name,b.append(d);const e=document.createElement("p");e.className="restaurants__text",e.innerHTML=a.neighborhood,b.append(e);const f=document.createElement("p");f.className="restaurants__text restaurants__text--small",f.innerHTML=a.address,b.append(f);const g=document.createElement("a");return g.className="btn",g.innerHTML="View Details",g.href=DBHelper.urlForRestaurant(a),b.append(g),b},addMarkersToMap=(a=self.restaurants)=>{a.forEach(a=>{const b=DBHelper.mapMarkerForRestaurant(a,self.map);google.maps.event.addListener(b,"click",()=>{window.location.href=b.url}),self.markers.push(b)})};