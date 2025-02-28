import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

print("MONGO_URI:", os.getenv("MONGO_URI"))
print("JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY"))

client = MongoClient(os.getenv("MONGO_URI"))
#db = client["HealthFitnessDB"]
db = client["FitFolkDB"]

users_collection = db["users"]
sleep_collection = db["sleep"]
achievements_collection = db["achievements"]
groups_collection = db["groups"]
notifications_collection = db["notifications"]
