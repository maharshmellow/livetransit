# updates the bus headings, bus numbers, and also the trip ids

import requests
import pickle

def update_bus():
    trips_url = "https://data.edmonton.ca/api/views/ctwr-tvrd/rows.json?accessType=DOWNLOAD"
    bus_heading_url = "https://data.edmonton.ca/resource/atvz-ppyb.json"

    trips_response = requests.get(trips_url)
    bus_heading_response = requests.get(bus_heading_url)

    if trips_response.status_code == 200 and bus_heading_response.status_code == 200:
        trips = trips_response.json()
        headings = bus_heading_response.json()

        bus_to_headings = {}
        trip_to_bus = {}
        a = {}
        for heading in headings:
            bus_to_headings[heading["route_id"]] = heading["route_long_name"]

        for item in trips["data"]:
            trip_id = item[-4] 
            bus_number = item[-6]
            bus_heading = bus_to_headings[bus_number]
            # print(item[-4], item[-6])

            trip_to_bus[trip_id] = [bus_number, bus_heading]

        with open('routes.pickle', 'wb') as handle:
            pickle.dump(trip_to_bus, handle, protocol=0)

update_bus()

