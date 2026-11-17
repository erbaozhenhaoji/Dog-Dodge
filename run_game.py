import os
import sys
import webbrowser
import threading
import time

# Reconfigure stdout/stderr encoding if available on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Ensure the dog_dodge_game directory is in sys.path and is current working directory
game_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dog_dodge_game')
if game_dir not in sys.path:
    sys.path.insert(0, game_dir)

os.chdir(game_dir)

from app import app, init_db

def open_browser():
    time.sleep(1.2)
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == '__main__':
    init_db()
    print("=" * 60)
    print(" [Dog Dodge Game] 白色金毛狗躲避老太太 Web小游戏")
    print(" 游戏服务器正在启动中...")
    print(" 本地访问地址: http://127.0.0.1:5000")
    print(" 按 Ctrl+C 可停止服务器")
    print("=" * 60)
    
    # Automatically open default web browser
    threading.Thread(target=open_browser, daemon=True).start()
    
    app.run(host='127.0.0.1', port=5000, debug=False)
