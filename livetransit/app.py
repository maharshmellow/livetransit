from flask import Flask, url_for
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
@app.route("/busstops")
def bus_stops():
    response = getBusStops()
    return response
    # return(url_for("static", filename="css/styles.css"))

if __name__ == "__main__":
    app.run(debug=True)
