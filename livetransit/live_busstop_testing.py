from google.transit import gtfs_realtime_pb2
import requests

url = "https://data.edmonton.ca/download/uzpc-8bnm/application%2Foctet-stream"
feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get(url)
feed.ParseFromString(response.content)

for entity in feed.entity: 
    print(entity)