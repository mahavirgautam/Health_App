from pymongo import MongoClient
import os
from dotenv import load_dotenv
import bcrypt

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
#db = client["HealthFitnessApp"]
db = client["FitFolk"]

# Create test user
hashed_password = bcrypt.hashpw("test123".encode('utf-8'), bcrypt.gensalt())

test_user = {
    "email": "testuser@example.com",
    "password": hashed_password
}

# Insert test user into 'users' collection
db.users.insert_one(test_user)

print("✅ Test user added successfully!")
