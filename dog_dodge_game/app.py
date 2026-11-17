import os
import sys
import sqlite3
from flask import Flask, render_template, request, jsonify

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'scores.db')

def init_db():
    """Initialize the SQLite database for high scores."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS high_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            dodged_count INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Insert initial default scores if table is empty
    cursor.execute('SELECT COUNT(*) FROM high_scores')
    if cursor.fetchone()[0] == 0:
        default_scores = [
            ('飞奔的金毛', 1250, 25),
            ('快乐小狗', 880, 18),
            ('避险大师', 520, 11),
            ('骨头狂魔', 300, 6)
        ]
        cursor.executemany(
            'INSERT INTO high_scores (player_name, score, dodged_count) VALUES (?, ?, ?)',
            default_scores
        )
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scores', methods=['GET'])
def get_scores():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT player_name, score, dodged_count, strftime('%Y-%m-%d %H:%M', created_at) 
            FROM high_scores 
            ORDER BY score DESC 
            LIMIT 10
        ''')
        rows = cursor.fetchall()
        conn.close()
        
        scores = [
            {
                "player_name": row[0],
                "score": row[1],
                "dodged_count": row[2],
                "date": row[3]
            }
            for row in rows
        ]
        return jsonify({"success": True, "scores": scores})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/scores', methods=['POST'])
def add_score():
    try:
        data = request.get_json() or {}
        player_name = str(data.get('player_name', '匿名狗勾')).strip()[:12] or '匿名狗勾'
        score = int(data.get('score', 0))
        dodged_count = int(data.get('dodged_count', 0))

        if score < 0:
            return jsonify({"success": False, "error": "Invalid score"}), 400

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO high_scores (player_name, score, dodged_count) VALUES (?, ?, ?)',
            (player_name, score, dodged_count)
        )
        conn.commit()

        # Check rank of current score
        cursor.execute('SELECT COUNT(*) FROM high_scores WHERE score > ?', (score,))
        rank = cursor.fetchone()[0] + 1
        conn.close()

        return jsonify({"success": True, "rank": rank, "message": "Score saved successfully!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    print("=" * 60)
    print(" [Dog Dodge Game] 白色金毛狗躲避老太太小游戏 启动成功！")
    print(" 请在浏览器打开: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
