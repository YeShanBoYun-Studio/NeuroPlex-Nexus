from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.modules.text_cache import TextCache
from datetime import datetime
import uuid
import config

app = Flask(__name__, static_folder=config.FRONTEND_BUILD_DIR)
CORS(app)
cache = TextCache()

def clean_prompt(prompt: str) -> str:
    return prompt.replace('"', "'").strip()

@app.route('/api/update_prompt', methods=['POST'])
def update_prompt():
    data = request.json
    try:
        entry = {
            "step_id": str(uuid.uuid4()),
            "content": data.get('content', ''),
            "prompt": clean_prompt(data.get('prompt', '')),
            "parent_id": data.get('parent_id'),
            "author": data.get('author', 'unknown'),
            "timestamp": datetime.now().isoformat()
        }
        cache.add_entry(entry)
        return jsonify({"status": "success", "step_id": entry["step_id"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
