from flask import Flask, jsonify, request, url_for
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Atlas URI - You should move this to an environment variable later
# MONGO_URI = "mongodb+srv://preetamdivakar:bu6sphE4pv5YwioC@cluster0.nazwmop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGO_URI = os.environ.get("MONGO_URI", "") + "&tls=true"

# Initialize MongoDB client with TLS options
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'), tls=True, tlsAllowInvalidCertificates=True)
    client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas!")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

# Select DB and collection
db = client["bakery_db"]
orders_collection = db["orders"]

# === ROUTES ===

@app.route("/")  # Root route to fix Render 404 issue
def home():
    return "🍞 Bakery backend is running!"

@app.route("/api/items")
def get_items():
    return jsonify([
        {
            "id": 1,
            "name": "Atta Biscuit",
            "description": "Traditional whole wheat biscuits with a touch of cardamom.",
            "price": 40.0,
            "image": url_for('static', filename='images/atta-biscuit.png', _external=True)
        },
        {
            "id": 2,
            "name": "Khara Puff",
            "description": "Crispy and flaky salted puff pastry perfect with tea.",
            "price": 25.0,
            "image": url_for('static', filename='images/khari-puff.png', _external=True)
        },
        {
            "id": 3,
            "name": "Nankhatai",
            "description": "Desi ghee-based shortbread cookies, soft and crumbly.",
            "price": 60.0,
            "image": url_for('static', filename='images/nankhatai.png', _external=True)
        },
        {
            "id": 4,
            "name": "Veg Patties",
            "description": "Spicy mixed veg filling inside a flaky pastry.",
            "price": 35.0,
            "image": url_for('static', filename='images/veg-patties.png', _external=True)
        },
        {
            "id": 5,
            "name": "Cream Roll",
            "description": "Soft roll cake filled with flavored whipped cream.",
            "price": 45.0,
            "image": url_for('static', filename='images/cream-roll.png', _external=True)
        },
        {
            "id": 6,
            "name": "Mawa Cake",
            "description": "Rich, moist cake made with mawa and cardamom.",
            "price": 70.0,
            "image": url_for('static', filename='images/mawa-cake.png', _external=True)
        },
        {
            "id": 7,
            "name": "Fruit Bun",
            "description": "Sweet bread with tutti-frutti bits, a bakery classic.",
            "price": 20.0,
            "image": url_for('static', filename='images/fruit-bun.png', _external=True)
        },
        {
            "id": 8,
            "name": "Paneer Puff",
            "description": "Delicious paneer masala wrapped in buttery puff pastry.",
            "price": 40.0,
            "image": url_for('static', filename='images/paneer-puff.png', _external=True)
        },
        {
            "id": 9,
            "name": "Chocolate Swiss Roll",
            "description": "Chocolate sponge cake rolled with cream and chocolate.",
            "price": 55.0,
            "image": url_for('static', filename='images/swiss-roll.png', _external=True)
        }
    ])

@app.route("/api/checkout", methods=["POST"])
def checkout():
    data = request.json
    if not data or not data.get("cart") or not data.get("total"):
        return jsonify({"error": "Invalid data"}), 400

    # Add timestamp
    data["ordered_timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        orders_collection.insert_one(data)
        return jsonify({"message": "Order received"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
