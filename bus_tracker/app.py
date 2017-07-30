from flask import Flask
from flask import jsonify
from live import getLiveData
app = Flask(__name__)

@app.route("/")
def index():
    return("Hello Worlds")

@app.route("/api/data")
def data():
    return jsonify(getLiveData())


if __name__ == "__main__":
    app.run(debug=True)
