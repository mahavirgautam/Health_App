from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
#db = client.HealthFitnessApp
db = client.FitFolk

users = db.users.find()
for user in users:
    print(user)  # Print user details to check password format
