from google.transit import gtfs_realtime_pb2
import requests
import pickle
import datetime


def getLiveData():
    """gets the realtime locations of all the busses"""

    with open("data/routes.pickle", "rb") as handle:
        routes = pickle.load(handle)

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
                print(trip_number + " missing")
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
            # print(entity)
            transit_data[vehicle] = vehicle_data

    return(transit_data)


def getTrip(request_trip_id):
    """gets the trip of a particular bus"""

    response = {}

    # gets when the bus is expected to come and to what stop
    live_stop_url = "https://data.edmonton.ca/download/uzpc-8bnm/application%2Foctet-stream"
    live_stop_feed = gtfs_realtime_pb2.FeedMessage()
    live_stop_response = requests.get(live_stop_url)
    if live_stop_response.status_code != 200:
        return ("1")
    live_stop_feed.ParseFromString(live_stop_response.content)

    # gets the location of each bus stop
    static_stop_url = "https://data.edmonton.ca/resource/kgzg-mxv6.json?$limit=10000"
    static_stop_response = requests.get(static_stop_url)
    if static_stop_response.status_code != 200:
        return("1")
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

                # format the time
                time = datetime.datetime.fromtimestamp(
                    int(time)).strftime("%H:%M")

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
