from google.transit import gtfs_realtime_pb2
import requests

def getTrip(request_trip_id):

    response = {}

    # shows when the bus is expected to come and to what stop
    live_stop_url = "https://data.edmonton.ca/download/uzpc-8bnm/application%2Foctet-stream"
    live_stop_feed = gtfs_realtime_pb2.FeedMessage()
    live_stop_response = requests.get(live_stop_url)
    if live_stop_response.status_code != 200: return ("1")
    live_stop_feed.ParseFromString(live_stop_response.content)

    # shows the location of each bus stop
    static_stop_url = "https://data.edmonton.ca/resource/kgzg-mxv6.json?$limit=10000"
    static_stop_response = requests.get(static_stop_url)
    if static_stop_response.status_code != 200: return("1")
    static_stop_data = static_stop_response.json()


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

                stop_id = item.stop_id

                # get the street address of the bus stop
                address = "N/A"
                for stop in static_stop_data:
                    if stop["stop_id"] == stop_id:
                        address = stop["stop_name"]
                        break

                print("Sequence: ", stop_sequence)
                # TODO use the stop sequence to get the ordering on the website correct but don't need to worry about displaying the sequence id
                print("Time: ", time)
                print("Stop ID: ", stop_id)
                print("Address: ", address)

getTrip("12806461")
