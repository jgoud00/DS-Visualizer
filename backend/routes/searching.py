from flask import Blueprint, request, jsonify

searching_bp = Blueprint('searching', __name__)

def create_frame(data, comparing=None, found=None, active=None, eliminated=None, pointers=None, message='', pseudocodeLine=0, phase=''):
    return {
        "data": [d for d in data],
        "comparing": comparing or [],
        "found": found or [],
        "active": active or [],
        "eliminated": eliminated or [],
        "pointers": pointers or {},
        "message": message,
        "pseudocodeLine": pseudocodeLine,
        "phase": phase
    }

def extract_val(item):
    if isinstance(item, dict) and 'val' in item:
        return item['val']
    return item

@searching_bp.route('/linear', methods=['POST'])
def linear_search():
    req = request.get_json()
    arr = req.get('array', [])
    target = req.get('target')
    frames = []

    if target is None:
        frames.append(create_frame(arr, message='No target specified', phase='done'))
        return jsonify({"frames": frames})

    if not arr:
        frames.append(create_frame(arr, message='Array is empty', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    n = len(a)
    
    frames.append(create_frame(a, message=f'Starting linear search for {target}', pseudocodeLine=1, phase='start'))

    for i in range(n):
        val = extract_val(a[i])
        frames.append(create_frame(a, comparing=[i], message=f'Checking index {i}: is {val} == {target}?', pseudocodeLine=2, phase='compare'))
        
        if val == target:
            frames.append(create_frame(a, found=[i], message=f'Target {target} found at index {i}!', pseudocodeLine=3, phase='found'))
            return jsonify({"frames": frames})

    frames.append(create_frame(a, message=f'Target {target} not found in the array.', pseudocodeLine=4, phase='not-found'))
    return jsonify({"frames": frames})


@searching_bp.route('/binary', methods=['POST'])
def binary_search():
    req = request.get_json()
    arr = req.get('array', [])
    target = req.get('target')
    frames = []

    if target is None:
        frames.append(create_frame(arr, message='No target specified', phase='done'))
        return jsonify({"frames": frames})

    if not arr:
        frames.append(create_frame(arr, message='Array is empty', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    
    left = 0
    right = len(a) - 1
    eliminated = []

    def get_pointers(l, r, m=None):
        p = {"LOW": l, "HIGH": r}
        if m is not None:
            p["MID"] = m
        return p

    frames.append(create_frame(a, active=list(range(left, right + 1)), pointers=get_pointers(left, right), message=f'Starting binary search for {target}. Array must be sorted.', pseudocodeLine=1, phase='start'))

    while left <= right:
        mid = (left + right) // 2
        val = extract_val(a[mid])
        
        frames.append(create_frame(a, comparing=[mid], active=list(range(left, right + 1)), eliminated=eliminated.copy(), pointers=get_pointers(left, right, mid), message=f'Left={left}, Right={right}. Checking mid={mid} (value: {val})', pseudocodeLine=3, phase='compare'))

        if val == target:
            frames.append(create_frame(a, found=[mid], active=list(range(left, right + 1)), eliminated=eliminated.copy(), pointers=get_pointers(left, right, mid), message=f'Target {target} found at index {mid}!', pseudocodeLine=4, phase='found'))
            return jsonify({"frames": frames})
        
        if val < target:
            eliminated.extend(range(left, mid + 1))
            frames.append(create_frame(a, active=list(range(mid + 1, right + 1)), eliminated=eliminated.copy(), pointers=get_pointers(left, right, mid), message=f'{val} < {target}. Discarding left half (indices {left} to {mid}).', pseudocodeLine=6, phase='discard-left'))
            left = mid + 1
        else:
            eliminated.extend(range(mid, right + 1))
            frames.append(create_frame(a, active=list(range(left, mid)), eliminated=eliminated.copy(), pointers=get_pointers(left, right, mid), message=f'{val} > {target}. Discarding right half (indices {mid} to {right}).', pseudocodeLine=8, phase='discard-right'))

    frames.append(create_frame(a, active=[], eliminated=eliminated.copy(), message=f'Target {target} not found in the array.', pseudocodeLine=9, phase='not-found'))
    return jsonify({"frames": frames})
