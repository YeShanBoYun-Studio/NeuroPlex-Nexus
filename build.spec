# -*- mode: python -*-
from PyInstaller.utils.hooks import collect_all

block_cipher = None

datas = [
    ('frontend/build', 'frontend/build'),
    ('data', './data'),
    ('backend/modules', 'backend/modules'),
    ('backend/modules/text_cache.py', 'backend/modules')
]

flask_data = collect_all('flask')
flask_cors_data = collect_all('flask_cors')

a = Analysis(
    ['backend/api/server.py'],
    pathex=[],
    binaries=[],
    datas=datas + flask_data[0] + flask_cors_data[0],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,  
    name='NeuraCollab',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
