const btn = document.getElementById('view-switcher');
const mapContainer = document.getElementById('map-container');
let mapVisible = false;

btn.addEventListener('click', () => {
  if (!mapVisible) {
    mapContainer.classList.add('content__left--visible');
    mapVisible = true;
    btn.innerText = 'list';
  } else {
    mapContainer.classList.remove('content__left--visible');
    mapVisible = false;
    btn.innerText = 'map';
  }
})
