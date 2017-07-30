from flask import Flask, url_for
from flask import jsonify
from live import getLiveData
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import render_template

app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

@app.route("/")
@limiter.exempt
def index():
    return("Hello Worlds")

@app.route("/api/data", methods=["GET"])
@limiter.limit("300/min")
def data():
    return jsonify(getLiveData())

@app.route("/test")
def test():
    return render_template("home.html")
    # return(url_for("static", filename="css/styles.css"))

if __name__ == "__main__":
    app.run(debug=True)
