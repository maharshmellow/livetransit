var map;
var markers = [];
var temp_markers = [];

function initMap() {
    // Create the map with no initial style specified.
    // It therefore has default styling.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 53.524,
            lng: -113.495
        },
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false
    });

    map.setOptions({
        styles: [{
            elementType: 'geometry',
            stylers: [{
                color: '#f5f5f5'
            }]
        }, {
            elementType: 'labels.icon',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#616161'
            }]
        }, {
            elementType: 'labels.text.stroke',
            stylers: [{
                color: '#f5f5f5'
            }]
        }, {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#bdbdbd'
            }]
        }, {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{
                color: '#eeeeee'
            }]
        }, {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#757575'
            }]
        }, {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{
                color: '#e5e5e5'
            }]
        }, {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#9e9e9e'
            }]
        }, {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{
                color: '#ffffff'
            }]
        }, {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#757575'
            }]
        }, {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{
                color: '#dadada'
            }]
        }, {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#616161'
            }]
        }, {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#9e9e9e'
            }]
        }, {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{
                color: '#e5e5e5'
            }]
        }, {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{
                color: '#eeeeee'
            }]
        }, {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{
                color: '#c9c9c9'
            }]
        }, {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#9e9e9e'
            }]
        }]
    });
    // start doing the polling for busses
    refreshMap();
}

function refreshMap() {
    $.ajax({
        url: '/api/data',
        success: function(response) {
            // NOTE console.log(response);
            // clear the current markers
            deleteMarkers();

            // draw the marker for each of the vehicles
            for (vehicle in response) {
                addMarker({ lat: parseFloat(response[vehicle].latitude), lng: parseFloat(response[vehicle].longitude) }, vehicle = response[vehicle]);
            }
        }
    });
    setTimeout(refreshMap, 15000);
}

// Adds a marker to the map and push to the array.
function addMarker(location, vehicle) {
    var marker = new google.maps.Marker({
        position: location,
        icon: {
            url: getIcon(vehicle.bus_number),
        },
        map: map
    });
    marker.tooltipContent = vehicle.trip_id;

    marker.addListener('click', function() {
        window.location.replace("/trip?id="+vehicle.trip_id+"&bus="+vehicle.bus_number+"&title="+vehicle.bus_title);
    });

    markers.push(marker);
}
// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}
// Generates an SVG icon for each bus based on the bus number
function getIcon(bus_number) {
    var icon = 'data:image/svg+xml;utf-8,<svg width="22px" height="22px" viewBox="0 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Artboard-3"><circle id="Oval-2" fill="#6F06FB" cx="11" cy="11" r="11"></circle><text font-family="monospace" font-size="11" font-style="bold" letter-spacing="-0.910000026" fill="#FFFFFF"><tspan x="11" y="15" text-anchor="middle">' + bus_number + '</tspan></text></g></g></svg>';

    return icon;
}
