import sys
import os

def get_base_path():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = os.path.join(get_base_path(), '..')
DATA_DIR = os.path.join(BASE_DIR, 'data')
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, 'frontend/build')
