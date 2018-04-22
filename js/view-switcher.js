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

btnFilter.addEventListener('click', () => {
  filterOptions.classList.add('filter-options--expanded');
})

closeBtn.addEventListener('click', () => {
  filterOptions.classList.remove('filter-options--expanded');
})

console.log('sdadsad')


