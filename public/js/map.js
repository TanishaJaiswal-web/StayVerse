

  

maptilersdk.config.apiKey = mapApi;

const map = new maptilersdk.Map({
    container: 'map', // container ID
    style: maptilersdk.MapStyle.STREETS,
    center: listing.geometry.coordinates, // [lng, lat]
    zoom: 9
});


// custom marker
    const createMarkerElement = () => {
  const container = document.createElement('div');
  container.className = 'marker-container';


  const pin = document.createElement('div');
  pin.className = 'marker-pin';


  const icon = document.createElement('i'); 
  icon.className = 'marker-icon fa-brands fa-staylinked';
 


  pin.appendChild(icon);
  container.appendChild(pin);

  return container;
}; 
const customElement = createMarkerElement();


// map marker
const marker = new maptilersdk.Marker({
element: customElement,
color: "#E05A47",
}).setLngLat(listing.geometry.coordinates)
.setPopup(new maptilersdk.Popup().setHTML(`<h6>StayVerse</h6>
<p>Exact location will be provided after booking</p>`))
.addTo(map);
