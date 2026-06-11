from flask import Blueprint, request, jsonify

graph_bp = Blueprint('graph', __name__)

@graph_bp.route('/dijkstra', methods=['POST'])
def dijkstra():
    return jsonify({"frames": []})
