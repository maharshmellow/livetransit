from flask import Flask
from flask import jsonify
from live import getLiveData
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

@app.route("/")
@limiter.exempt
def index():
    return("Hello Worlds")

@app.route("/api/data")
@limiter.limit("300/minute")
def data():
    return jsonify(getLiveData())


if __name__ == "__main__":
    app.run(debug=True)
