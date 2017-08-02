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

    // Add a style-selector control to the map.
    var styleControl = document.getElementById('style-selector-control');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

    // Set the map's style to the initial value of the selector.
    var styleSelector = document.getElementById('style-selector');
    map.setOptions({
        styles: styles[styleSelector.value]
    });


    // Apply new JSON when the user selects a different style.
    styleSelector.addEventListener('change', function() {
        map.setOptions({
            styles: styles[styleSelector.value]
        });
    });
    
    refreshMap();


}

function refreshMap() {
    $.ajax({
        url: '/api/data',
        success: function(response) {
            console.log(response);
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
        // icon: {
        //     path: google.maps.SymbolPath.CIRCLE,
        //     scale: 7,
        // },
        // icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        icon: {
            url: getIcon(vehicle.bus_number),
        },
        map: map
    });
    marker.tooltipContent = vehicle.bus_number;

    marker.addListener('mouseover', function() {
        var point = fromLatLngToPoint(marker.getPosition(), map);
        $('#marker-tooltip').html(marker.tooltipContent).css({
            'left': point.x,
            'top': point.y + 40
        }).show();
    });

    marker.addListener('mouseout', function() {
        $('#marker-tooltip').hide();
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

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function fromLatLngToPoint(latLng, map) {
    var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

function getIcon(bus_number) {
    var icon = 'data:image/svg+xml;utf-8,<svg width="22px" height="22px" viewBox="0 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Artboard-3"><circle id="Oval-2" fill="#6F06FB" cx="11" cy="11" r="11"></circle><text font-family="FiraCode-Bold, Fira Code" font-size="11" font-weight="bold" letter-spacing="-0.910000026" fill="#FFFFFF"><tspan x="11" y="15" text-anchor="middle">' + bus_number + '</tspan></text></g></g></svg>';

    return icon;
}

function drawBusStops() {
    $.ajax({
        url: "https://data.edmonton.ca/resource/kgzg-mxv6.json",
        type: "GET",
        data: {
            "$limit": 15000,
            "$$app_token": "vu8fYnEhfqY4RWYLqE3occS7R"
        }
    }).done(function(data) {
        // console.log(data[0]);
        for (bus_stop in data){
        //     console.log(data[bus_stop].stop_lat);
        
            //TODO draw the markers here for all the bus stops
            var marker = new google.maps.Marker({

                position: {lat:parseFloat(data[bus_stop].stop_lat), lng: parseFloat(data[bus_stop].stop_lon)},
                icon: "static/images/bus_stop.svg",
                map: map
            });
            marker.tooltipContent = data[bus_stop].stop_code+ ": " + data[bus_stop].stop_name;

            marker.addListener('mouseover', function() {
                var point = fromLatLngToPoint(marker.getPosition(), map);
                $('#marker-tooltip').html(marker.tooltipContent).css({
                    'left': point.x,
                    'top': point.y + 40
                }).show();
            });

            marker.addListener('mouseout', function() {
                $('#marker-tooltip').hide();
            });
        }
    });
}


var styles = {
    default: null,
    silver: [{
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
    }],

    night: [{
        elementType: 'geometry',
        stylers: [{
            color: '#242f3e'
        }]
    }, {
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#242f3e'
        }]
    }, {
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#746855'
        }]
    }, {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    }, {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    }, {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{
            color: '#263c3f'
        }]
    }, {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#6b9a76'
        }]
    }, {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{
            color: '#38414e'
        }]
    }, {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#212a37'
        }]
    }, {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#9ca5b3'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{
            color: '#746855'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#1f2835'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#f3d19c'
        }]
    }, {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{
            color: '#2f3948'
        }]
    }, {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    }, {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{
            color: '#17263c'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#515c6d'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#17263c'
        }]
    }],

    retro: [{
        elementType: 'geometry',
        stylers: [{
            color: '#ebe3cd'
        }]
    }, {
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#523735'
        }]
    }, {
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#f5f1e6'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#c9b2a6'
        }]
    }, {
        featureType: 'administrative.land_parcel',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#dcd2be'
        }]
    }, {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#ae9e90'
        }]
    }, {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{
            color: '#dfd2ae'
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
            color: '#dfd2ae'
        }]
    }, {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#93817c'
        }]
    }, {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{
            color: '#a5b076'
        }]
    }, {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#447530'
        }]
    }, {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{
            color: '#f5f1e6'
        }]
    }, {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{
            color: '#fdfcf8'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{
            color: '#f8c967'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#e9bc62'
        }]
    }, {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{
            color: '#e98d58'
        }]
    }, {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#db8555'
        }]
    }, {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#806b63'
        }]
    }, {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{
            color: '#dfd2ae'
        }]
    }, {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#8f7d77'
        }]
    }, {
        featureType: 'transit.line',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#ebe3cd'
        }]
    }, {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{
            color: '#dfd2ae'
        }]
    }, {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{
            color: '#b9d3c2'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#92998d'
        }]
    }],

    hiding: [{
        featureType: 'poi.business',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }]
};
