from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from backend.modules.text_cache import TextCache
from datetime import datetime
import uuid
from backend import config

class NeuraCollabAPI:
    def __init__(self):
        self.app = Flask(__name__, 
                        static_folder=config.FRONTEND_BUILD_DIR,
                        static_url_path='/static')
        CORS(self.app)
        self.cache = TextCache()
        self.setup_routes()

    def setup_routes(self):
        # 服务前端静态文件
        @self.app.route('/')
        def serve_frontend():
            return self.app.send_static_file('index.html')

        # API路由
        @self.app.route('/api/update_prompt', methods=['POST'])
        def update_prompt():
            data = request.json
            try:
                entry = {
                    "step_id": str(uuid.uuid4()),
                    "content": data.get('content', ''),
                    "prompt": self._clean_prompt(data.get('prompt', '')),
                    "parent_id": data.get('parent_id'),
                    "author": data.get('author', 'unknown'),
                    "timestamp": datetime.now().isoformat()
                }
                self.cache.add_entry(entry)
                return jsonify({"status": "success", "step_id": entry["step_id"]})
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)}), 400

        @self.app.route('/api/get_history', methods=['GET'])
        def get_history():
            try:
                history = self.cache.get_branch(request.args.get('root_id'))
                return jsonify({"status": "success", "history": history})
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)}), 400

    def _clean_prompt(self, prompt: str) -> str:
        return prompt.replace('"', "'").strip()

    def run(self, host='0.0.0.0', port=5000, debug=True):
        self.app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    api = NeuraCollabAPI()
    api.run()
