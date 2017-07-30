from google.transit import gtfs_realtime_pb2
import requests
import pickle

with open("data/routes.pickle", "rb") as handle:
    routes = pickle.load(handle)

def getLiveData():

    live_data_url = "https://data.edmonton.ca/download/7qed-k2fc/application%2Foctet-stream"

    feed = gtfs_realtime_pb2.FeedMessage()
    response = requests.get(live_data_url)
    feed.ParseFromString(response.content)

    for entity in feed.entity:
        if entity.HasField("vehicle"):
            trip_number = entity.vehicle.trip.trip_id
            bus_number, bus_title = routes[trip_number]
            vehicle = entity.vehicle.vehicle.id
            latitude = entity.vehicle.position.latitude
            longitude = entity.vehicle.position.longitude
            bearing = entity.vehicle.position.bearing

            vehicle_data = {"bus_number":bus_number, "bus_title":bus_title, "vehicle":vehicle, "latitude":latitude, "longitude":longitude, "bearing":bearing}

            print(vehicle_data)


getLiveData()