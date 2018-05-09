from flask import Flask, url_for, request, redirect
from flask import jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import render_template
from google.transit import gtfs_realtime_pb2
from helpers import *

app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

@app.route("/")
@limiter.limit("200/hour")
def index():
    return render_template("home.html")

@app.route("/data", methods=["GET"])
@limiter.limit("200/hour")
def data():
    response = jsonify(get_bus_location())
    return response

@app.route("/trip")
@limiter.limit("200/hour")
def trip():
    trip_id = request.args.get("id")
    bus_number = request.args.get("bus")
    bus_title = request.args.get("title")
    
    if not trip_id:
        return redirect("/", code=302)

    trip_data = get_trip(trip_id)
    if not trip_data:
        return redirect("/", code=302)

    return render_template("trip.html", bus_number=bus_number, bus_title=bus_title, data=trip_data)


if __name__ == "__main__":
    app.run()
