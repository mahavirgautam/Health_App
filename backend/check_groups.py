from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
#db = client.HealthFitnessApp
db = client.FitFolk
groups_collection = db.groups

# Fetch groups
groups = list(groups_collection.find({}, {"_id": 0, "name": 1, "members": 1}))

if groups:
    print("✅ Groups in Database:")
    for group in groups:
        print(group)
else:
    print("❌ No groups found.")
