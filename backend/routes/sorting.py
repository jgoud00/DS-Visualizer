from flask import Blueprint, request, jsonify

sorting_bp = Blueprint('sorting', __name__)

def create_frame(data, comparing=None, swapping=None, sorted_idx=None, active=None, message='', pseudocodeLine=0, phase=''):
    return {
        "data": [d for d in data],
        "comparing": comparing or [],
        "swapping": swapping or [],
        "sorted": sorted_idx or [],
        "active": active or [],
        "message": message,
        "pseudocodeLine": pseudocodeLine,
        "phase": phase
    }

def extract_val(item):
    if isinstance(item, dict) and 'val' in item:
        return item['val']
    return item

@sorting_bp.route('/bubble', methods=['POST'])
def bubble_sort():
    req = request.get_json()
    arr = req.get('array', [])
    
    frames = []
    
    if len(arr) == 0:
        frames.append(create_frame(arr, message='Array is empty', phase='done'))
        return jsonify({"frames": frames})
    if len(arr) == 1:
        frames.append(create_frame(arr, sorted_idx=[0], message='Array has only one element — already sorted', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    n = len(a)
    sorted_indices = []

    for i in range(n - 1):
        swapped = False
        frames.append(create_frame(a, sorted_idx=sorted_indices.copy(), message=f'Starting pass {i + 1}', pseudocodeLine=1, phase='pass-start'))

        for j in range(n - i - 1):
            val1 = extract_val(a[j])
            val2 = extract_val(a[j + 1])
            frames.append(create_frame(a, comparing=[j, j + 1], sorted_idx=sorted_indices.copy(), message=f'Comparing arr[{j}]={val1} and arr[{j + 1}]={val2}', pseudocodeLine=4, phase='compare'))

            if val1 > val2:
                frames.append(create_frame(a, swapping=[j, j + 1], sorted_idx=sorted_indices.copy(), message=f'{val1} > {val2} — swapping', pseudocodeLine=5, phase='swap'))
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
                frames.append(create_frame(a, swapping=[j, j + 1], sorted_idx=sorted_indices.copy(), message=f'Swapped → arr[{j}]={extract_val(a[j])}, arr[{j + 1}]={extract_val(a[j+1])}', pseudocodeLine=6, phase='swap-done'))

        sorted_indices.append(n - 1 - i)
        frames.append(create_frame(a, sorted_idx=sorted_indices.copy(), message=f'Pass {i + 1} complete — position {n - 1 - i} is sorted', pseudocodeLine=1, phase='pass-end'))

        if not swapped:
            frames.append(create_frame(a, sorted_idx=list(range(n)), message='No swaps this pass — array is sorted!', pseudocodeLine=7, phase='early-termination'))
            return jsonify({"frames": frames})

    sorted_indices.append(0)
    frames.append(create_frame(a, sorted_idx=list(range(n)), message='Bubble sort complete!', pseudocodeLine=8, phase='done'))
    return jsonify({"frames": frames})


@sorting_bp.route('/selection', methods=['POST'])
def selection_sort():
    req = request.get_json()
    arr = req.get('array', [])
    frames = []

    if len(arr) == 0:
        frames.append(create_frame(arr, message='Array is empty', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    n = len(a)
    sorted_indices = []

    for i in range(n - 1):
        min_index = i
        frames.append(create_frame(a, sorted_idx=sorted_indices.copy(), active=[min_index], message=f'Pass {i + 1}: assuming arr[{i}]={extract_val(a[i])} is the minimum', pseudocodeLine=2, phase='set-min'))

        for j in range(i + 1, n):
            frames.append(create_frame(a, comparing=[j], sorted_idx=sorted_indices.copy(), active=[min_index], message=f'Comparing arr[{j}]={extract_val(a[j])} with current min arr[{min_index}]={extract_val(a[min_index])}', pseudocodeLine=3, phase='compare'))
            if extract_val(a[j]) < extract_val(a[min_index]):
                min_index = j
                frames.append(create_frame(a, sorted_idx=sorted_indices.copy(), active=[min_index], message=f'New minimum found: arr[{min_index}]={extract_val(a[min_index])}', pseudocodeLine=5, phase='new-min'))

        if min_index != i:
            frames.append(create_frame(a, swapping=[i, min_index], sorted_idx=sorted_indices.copy(), message=f'Swapping arr[{i}]={extract_val(a[i])} with arr[{min_index}]={extract_val(a[min_index])}', pseudocodeLine=6, phase='swap'))
            a[i], a[min_index] = a[min_index], a[i]
            frames.append(create_frame(a, swapping=[i, min_index], sorted_idx=sorted_indices.copy(), message=f'Swapped → arr[{i}]={extract_val(a[i])}', pseudocodeLine=6, phase='swap-done'))

        sorted_indices.append(i)
        frames.append(create_frame(a, sorted_idx=sorted_indices.copy(), message=f'Position {i} is now sorted with value {extract_val(a[i])}', pseudocodeLine=6, phase='mark-sorted'))

    sorted_indices.append(n - 1)
    frames.append(create_frame(a, sorted_idx=sorted_indices.copy(), message='Selection sort complete!', pseudocodeLine=7, phase='done'))
    return jsonify({"frames": frames})


@sorting_bp.route('/insertion', methods=['POST'])
def insertion_sort():
    req = request.get_json()
    arr = req.get('array', [])
    frames = []

    if len(arr) == 0:
        frames.append(create_frame(arr, message='Array is empty', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    n = len(a)
    frames.append(create_frame(a, sorted_idx=[0], message='First element is trivially sorted', phase='init'))

    for i in range(1, n):
        j = i
        frames.append(create_frame(a, sorted_idx=list(range(i)), active=[i], message=f'Picking key = arr[{i}] = {extract_val(a[i])}', pseudocodeLine=2, phase='pick-key'))

        while j > 0 and extract_val(a[j - 1]) > extract_val(a[j]):
            frames.append(create_frame(a, comparing=[j - 1], sorted_idx=list(range(i)), active=[j], message=f'arr[{j-1}]={extract_val(a[j-1])} > key={extract_val(a[j])} — swapping', pseudocodeLine=4, phase='compare-shift'))
            a[j], a[j - 1] = a[j - 1], a[j]
            frames.append(create_frame(a, swapping=[j - 1, j], sorted_idx=list(range(i)), message=f'Swapped arr[{j-1}] and arr[{j}]', pseudocodeLine=5, phase='shift'))
            j -= 1

        frames.append(create_frame(a, sorted_idx=list(range(i + 1)), active=[j], message=f'Placed key at position {j}', pseudocodeLine=7, phase='place-key'))

    frames.append(create_frame(a, sorted_idx=list(range(n)), message='Insertion sort complete!', pseudocodeLine=8, phase='done'))
    return jsonify({"frames": frames})

@sorting_bp.route('/merge', methods=['POST'])
def merge_sort():
    req = request.get_json()
    arr = req.get('array', [])
    frames = []

    if len(arr) <= 1:
        frames.append(create_frame(arr, message='Array is sorted', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    n = len(a)
    sorted_indices = set()

    def merge_sort_helper(left, right):
        if left >= right:
            frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=[left], message=f'Base case: subarray [{left}] has one element ({extract_val(a[left])})', pseudocodeLine=1, phase='base-case'))
            return

        mid = (left + right) // 2
        frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=list(range(left, right + 1)), message=f'Splitting [{left}..{right}] into [{left}..{mid}] and [{mid + 1}..{right}]', pseudocodeLine=2, phase='split'))

        merge_sort_helper(left, mid)
        merge_sort_helper(mid + 1, right)

        frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=list(range(left, right + 1)), message=f'Merging [{left}..{mid}] and [{mid + 1}..{right}]', pseudocodeLine=5, phase='merge-start'))
        merge_in_place(left, mid, right)

    def merge_in_place(left, mid, right):
        i = left
        j = mid + 1
        
        frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=list(range(left, right + 1)), message=f'In-place merge started', pseudocodeLine=9, phase='merge-start'))

        while i <= mid and j <= right:
            frames.append(create_frame(a, comparing=[i, j], sorted_idx=list(sorted_indices), active=[i, j], message=f'Comparing a[{i}]={extract_val(a[i])} with a[{j}]={extract_val(a[j])}', pseudocodeLine=10, phase='merge-compare'))
            
            if extract_val(a[i]) <= extract_val(a[j]):
                i += 1
            else:
                value = a[j]
                frames.append(create_frame(a, comparing=[], sorted_idx=list(sorted_indices), active=[i, j], message=f'{extract_val(a[j])} is smaller, shifting elements to make room', pseudocodeLine=11, phase='merge-shift-start'))
                
                # Shift all elements between i and j-1 right by 1
                idx = j
                while idx > i:
                    a[idx], a[idx - 1] = a[idx - 1], a[idx]
                    frames.append(create_frame(a, swapping=[idx, idx - 1], sorted_idx=list(sorted_indices), active=[i], message=f'Shifting {extract_val(a[idx])} right', pseudocodeLine=12, phase='merge-shift'))
                    idx -= 1
                
                i += 1
                mid += 1
                j += 1

        if left == 0 and right == n - 1:
            for idx in range(left, right + 1):
                sorted_indices.add(idx)

        frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=list(range(left, right + 1)), message=f'Merged [{left}..{right}]', pseudocodeLine=5, phase='merge-end'))

    merge_sort_helper(0, n - 1)
    frames.append(create_frame(a, sorted_idx=list(range(n)), message='Merge sort complete!', pseudocodeLine=0, phase='done'))
    return jsonify({"frames": frames})


@sorting_bp.route('/quick', methods=['POST'])
def quick_sort():
    req = request.get_json()
    arr = req.get('array', [])
    frames = []

    if len(arr) <= 1:
        frames.append(create_frame(arr, message='Array is sorted', phase='done'))
        return jsonify({"frames": frames})

    a = arr.copy()
    n = len(a)
    sorted_indices = set()

    def partition(low, high):
        pivot = a[high]
        frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=[high], message=f'Pivot selected: arr[{high}]={extract_val(pivot)}', pseudocodeLine=7, phase='pivot-select'))
        i = low - 1

        for j in range(low, high):
            frames.append(create_frame(a, comparing=[j, high], sorted_idx=list(sorted_indices), active=[high], message=f'Comparing arr[{j}]={extract_val(a[j])} with pivot={extract_val(pivot)}', pseudocodeLine=9, phase='partition-compare'))
            if extract_val(a[j]) <= extract_val(pivot):
                i += 1
                if i != j:
                    frames.append(create_frame(a, swapping=[i, j], sorted_idx=list(sorted_indices), active=[high], message=f'{extract_val(a[j])} <= {extract_val(pivot)} — swapping arr[{i}]={extract_val(a[i])} and arr[{j}]={extract_val(a[j])}', pseudocodeLine=11, phase='partition-swap'))
                    a[i], a[j] = a[j], a[i]
                    frames.append(create_frame(a, swapping=[i, j], sorted_idx=list(sorted_indices), active=[high], message=f'Swapped → arr[{i}]={extract_val(a[i])}, arr[{j}]={extract_val(a[j])}', pseudocodeLine=11, phase='partition-swap-done'))
                else:
                    frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=[high], message=f'{extract_val(a[j])} <= {extract_val(pivot)} — already in place', pseudocodeLine=10, phase='partition-no-swap'))
        
        pivotPos = i + 1
        if pivotPos != high:
            frames.append(create_frame(a, swapping=[pivotPos, high], sorted_idx=list(sorted_indices), message=f'Placing pivot {extract_val(pivot)} at position {pivotPos}', pseudocodeLine=12, phase='pivot-place'))
            a[pivotPos], a[high] = a[high], a[pivotPos]

        sorted_indices.add(pivotPos)
        frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=[pivotPos], message=f'Pivot {extract_val(pivot)} is now at its final position {pivotPos}', pseudocodeLine=13, phase='pivot-final'))
        return pivotPos

    def qs(low, high):
        if low < high:
            pi = partition(low, high)
            frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=list(range(low, high + 1)), message=f'Recursing into left [{low}..{pi - 1}] and right [{pi + 1}..{high}]', pseudocodeLine=2, phase='recurse'))
            qs(low, pi - 1)
            qs(pi + 1, high)
        elif low == high:
            sorted_indices.add(low)
            frames.append(create_frame(a, sorted_idx=list(sorted_indices), active=[low], message=f'Single element arr[{low}]={extract_val(a[low])} is in its final position', pseudocodeLine=1, phase='base-case'))

    qs(0, n - 1)
    frames.append(create_frame(a, sorted_idx=list(range(n)), message='Quick sort complete!', pseudocodeLine=0, phase='done'))
    return jsonify({"frames": frames})
