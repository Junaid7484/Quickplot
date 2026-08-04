mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", 
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates,
  zoom: 10,
});

const popupHTML = `
  <div style="
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 12px 14px;
    border-radius: 14px;
    color: #0f172a;
    background: #ffffff;
    max-width: 260px;
    height: 110px;
  ">
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(241, 118, 73, 0.1);
      color: #f17649;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 50px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    ">
      <i class="fa-solid fa-location-dot"></i> Verified Plot
    </div>
    
    <h4 style="
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #0f172a;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    ">
      ${quickplot.title}
    </h4>
    
    <p style="
      font-size: 12px;
      color: #64748b;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      <span style="color: #94a3b8;">📍</span> ${quickplot.location}
    </p>
  </div>
`;

// Create Marker & Attach Popup
const marker = new mapboxgl.Marker({ color: "#f17649" })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ 
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      className: 'custom-mapbox-popup'
    })
      .setHTML(popupHTML)
      .setMaxWidth("280px")
  )
  .addTo(map);
