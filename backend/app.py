from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.sorting import sorting_bp
from routes.searching import searching_bp
from routes.structures import structures_bp
from routes.graph import graph_bp

app = Flask(__name__)
CORS(app) # Enable CORS for the React frontend

# Register Blueprints
app.register_blueprint(sorting_bp, url_prefix='/api/sort')
app.register_blueprint(searching_bp, url_prefix='/api/search')
app.register_blueprint(structures_bp, url_prefix='/api/structures')
app.register_blueprint(graph_bp, url_prefix='/api/graph')

@app.route('/')
def index():
    return jsonify({"status": "CFAI Python Backend is running!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
