from flask import Flask, url_for, request, redirect
from flask import jsonify
from live import *
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import render_template
import time

app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

@app.route("/")
@limiter.exempt
def index():
    return("Hello Worlds")

@app.route("/api/data", methods=["GET"])
@limiter.limit("300/hour")
def data():
    response = jsonify(getLiveData())
    response.cache_control.max_age = 1
    return response

@app.route("/test")
def test():
    return render_template("home.html")

@app.route("/trip")
def trip():
    trip_id = request.args.get("id")
    bus_number = request.args.get("bus")
    bus_title = request.args.get("title")

    if not trip_id:
        return redirect("/test", code=302)

    response = getTrip(trip_id)
    if not response:
        return redirect("/test", code=302)

    return render_template("trip.html", bus_number=bus_number, bus_title=bus_title, data=response)

if __name__ == "__main__":
    app.run(debug=True)
