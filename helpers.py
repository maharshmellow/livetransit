import requests
import time
import datetime
import pytz
from google.transit import gtfs_realtime_pb2
from werkzeug.contrib.cache import SimpleCache

cache = SimpleCache()

def get_bus_location():
    """get the live location of all the busses"""
    routes = get_routes()

    live_data_url = "https://data.edmonton.ca/download/7qed-k2fc/application%2Foctet-stream"

    feed = gtfs_realtime_pb2.FeedMessage()
    response = requests.get(live_data_url)
    feed.ParseFromString(response.content)

    transit_data = {}       # contains the informtion for all the busses
    for entity in feed.entity:
        if entity.HasField("vehicle"):
            trip_number = entity.vehicle.trip.trip_id
            # sometimes the live bus trip ids don't show up in the routes database
            if trip_number not in routes:
                # print(trip_number + " missing")
                continue

            bus_number, bus_title = routes[trip_number]
            vehicle = entity.vehicle.vehicle.id
            
            # the higher one seems to be correct - sometimes the vehicle id is too short
            if entity.vehicle.vehicle.label:
                vehicle = max(int(entity.vehicle.vehicle.id),
                              int(entity.vehicle.vehicle.label))
            latitude = entity.vehicle.position.latitude
            longitude = entity.vehicle.position.longitude
            bearing = entity.vehicle.position.bearing

            vehicle_data = {"bus_number": bus_number,
                            "bus_title": bus_title,
                            "latitude": latitude,
                            "longitude": longitude,
                            "bearing": bearing,
                            "trip_id": trip_number}

            transit_data[vehicle] = vehicle_data
    
    return(transit_data)

def get_trip(request_trip_id):
    """gets the trip of a particular bus"""

    # gets when the bus is expected to come and to what stop
    live_stop_url = "https://data.edmonton.ca/download/uzpc-8bnm/application%2Foctet-stream"
    live_stop_feed = gtfs_realtime_pb2.FeedMessage()
    live_stop_response = requests.get(live_stop_url)
    if live_stop_response.status_code != 200:
        return False
    live_stop_feed.ParseFromString(live_stop_response.content)

    # gets the static location of each bus stop
    static_stop_url = "https://data.edmonton.ca/resource/kgzg-mxv6.json?$limit=10000"
    static_stop_response = requests.get(static_stop_url)
    if static_stop_response.status_code != 200:
        return False
    static_stop_data = static_stop_response.json()

    trip = {}

    for entity in live_stop_feed.entity:
        trip_id = entity.trip_update.trip.trip_id
        if trip_id == request_trip_id:
            # iterate through all the bus stops
            for item in entity.trip_update.stop_time_update:
                # get the time when the bus either will arrive or arrived
                stop_sequence = item.stop_sequence
                time = item.departure.time
                if not time:
                    time = item.arrival.time

                # format the time - need to take into account the timezone because
                # heroku runs from a different location so the times get messed up
                timezone = pytz.timezone("Canada/Mountain")
                time = datetime.datetime.fromtimestamp(int(time), timezone).strftime("%H:%M")

                stop_id = item.stop_id

                if stop_id and int(stop_id) < 0:
                    continue

                # get the street address of the bus stop
                address = "N/A"
                for stop in static_stop_data:
                    if stop["stop_id"] == stop_id:
                        address = stop["stop_name"]
                        break

                trip_item = {"stop": stop_id, "address": address, "time": time}
                trip[stop_sequence] = trip_item

    return trip

def get_routes():
    """get the bus headings, bus numbers, and also the trip ids"""
    # get from cache if it exists
    routes = cache.get("routes")
    if routes:
        return routes

    print("getting routes")
    trips_url = "https://data.edmonton.ca/api/views/ctwr-tvrd/rows.json?accessType=DOWNLOAD"
    bus_heading_url = "https://data.edmonton.ca/resource/atvz-ppyb.json"

    trips_response = requests.get(trips_url)
    bus_heading_response = requests.get(bus_heading_url)

    if trips_response.status_code == 200 and bus_heading_response.status_code == 200:
        trips = trips_response.json()
        headings = bus_heading_response.json()

        bus_to_headings = {}
        trip_to_bus = {}

        for heading in headings:
            bus_to_headings[heading["route_id"]] = heading["route_long_name"]

        for item in trips["data"]:
            trip_id = item[-4]
            bus_number = item[-6]
            bus_heading = bus_to_headings[bus_number]

            trip_to_bus[trip_id] = [bus_number, bus_heading]
        
        # store the routes in the cache for five minutes
        cache.set("routes", trip_to_bus, timeout=5*60)        
        return trip_to_bus

init_cache = get_routes     # alias for easy readibility