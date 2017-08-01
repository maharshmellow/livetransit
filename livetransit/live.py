from google.transit import gtfs_realtime_pb2
import requests
import pickle

def getLiveData():

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
            # if the label exists, get the higher of the two
            # sometimes the label is wrong but sometimes its correct
            if entity.vehicle.vehicle.label:
                vehicle = max(int(entity.vehicle.vehicle.id), int(entity.vehicle.vehicle.label))
            latitude = entity.vehicle.position.latitude
            longitude = entity.vehicle.position.longitude
            bearing = entity.vehicle.position.bearing

            vehicle_data = {"bus_number":bus_number, 
                            "bus_title":bus_title,
                            "latitude":latitude, 
                            "longitude":longitude, 
                            "bearing":bearing}
            # print(entity)
            transit_data[vehicle] = vehicle_data

    return(transit_data)


def getBusStops():

    url = "https://data.edmonton.ca/resource/kgzg-mxv6.json"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print(data)


    return("1")














