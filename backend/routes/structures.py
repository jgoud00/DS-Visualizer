from flask import Blueprint, request, jsonify

structures_bp = Blueprint('structures', __name__)

@structures_bp.route('/stack', methods=['POST'])
def stack():
    return jsonify({"frames": []})
