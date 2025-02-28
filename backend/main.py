import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import traceback

from itsdangerous import URLSafeTimedSerializer

load_dotenv()

app=Flask(__name__)
CORS(app)

MONGO_URI=os.getenv("MONGO_URI")
client=MongoClient(MONGO_URI)
db = client.HealthFitnessApp
#db=client.FitFolk
users_collection=db.users
sleep_collection=db.sleep
achievements_collection=db.achievements
groups_collection=db.groups
meal_collection=db.meals
badges_collection=db.badges
progress_collection=db.progress

app.config["JWT_SECRET_KEY"]=os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

@app.route("/",methods=["GET"])
def home():
    return jsonify({"message": "Flask API is running!"})

@app.route("/api/register",methods=["POST"])
def register():
    data=request.json
    email=data.get("email")
    password=data.get("password")

    if users_collection.find_one({"email":email}):
        return jsonify({"error":"User already exists"}),400

    hashed_password=bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())
    users_collection.insert_one({"email":email,"password":hashed_password})
    
    return jsonify({"message":"User registered successfully!"}),201

@app.route("/api/login",methods=["POST"])
def login():
    data=request.json
    email=data.get("email")
    password=data.get("password")

    user=users_collection.find_one({"email":email})

    if not user:
        return jsonify({"error":"Invalid email or password"}),401

    stored_password=user["password"]
    if isinstance(stored_password,str):
        stored_password=stored_password.encode('utf-8')

    if bcrypt.checkpw(password.encode('utf-8'),stored_password):
        token = create_access_token(identity=email)
        return jsonify({"message":"Login successful","token":token}),200

    return jsonify({"error":"Invalid email or password"}),401

@app.route("/api/log-sleep",methods=["POST"])
@jwt_required()
def log_sleep():
    data=request.json
    user_email=get_jwt_identity()

    sleep_entry={
        "user":user_email,
        "date":data.get("date"),
        "sleep_hours":float(data.get("sleep_hours")),
    }
    sleep_collection.insert_one(sleep_entry)

    return jsonify({"message":"Sleep data logged successfully!"}),201

@app.route("/api/get-achievements",methods=["GET"])
@jwt_required()
def get_achievements():
    user_email=get_jwt_identity()
    achievements=list(achievements_collection.find({"user": user_email},{"_id":0}))
    return jsonify(achievements)

@app.route("/api/like-achievement",methods=["POST"])
@jwt_required()
def like_achievement():
    data=request.json
    user_email=get_jwt_identity()
    achievement_title=data.get("title")

    result = achievements_collection.update_one(
        {"title":achievement_title,"user":user_email},
        {"$inc":{"likes":1}}
    )

    if result.modified_count > 0:
        return jsonify({"message":"Achievement liked!"}),200
    return jsonify({"error": "Achievement not found"}),404

@app.route("/api/join-group",methods=["POST"])
@jwt_required()
def join_group():
    data=request.json
    user=get_jwt_identity()
    group_name=data.get("group_name")

    if not group_name:
        return jsonify({"error":"Group name is required"}),400

    group = groups_collection.find_one({"name":group_name})

    if not group:
        groups_collection.insert_one({"name":group_name,"members": [user],"posts":[]})
        return jsonify({"message": f"Group '{group_name}'created and joined successfully!"}),201

    if user not in group["members"]:
        groups_collection.update_one({"name":group_name},{"$push":{"members": user}})
        return jsonify({"message":f"Joined {group_name} successfully!"}),200

    return jsonify({"message":f"Already a member of {group_name}!"}),200


@app.route("/api/group-post",methods=["POST"])
@jwt_required()
def group_post():
    data = request.json
    user = get_jwt_identity()
    group_name = data.get("group_name")
    content = data.get("content")

    if not group_name or not content:
        return jsonify({"error":"Group name and content are required"}),400

    group = groups_collection.find_one({"name":group_name})

    if not group or user not in group.get("members", []):
        return jsonify({"error": "You are not a member of this group"}), 403

    post = {
        "user": user,
        "content": content,
        "likes": 0,
        "comments": []
    }

    result = groups_collection.update_one({"name": group_name}, {"$push":{"posts": post}})

    if result.modified_count > 0:
        return jsonify({"message": "Post added successfully!"}), 201
    return jsonify({"error": "Group not found"}), 404


@app.route("/api/like-post", methods=["POST"])
@jwt_required()
def like_post():
    data = request.json
    group_name = data.get("group_name")
    post_content = data.get("post_content")

    result = groups_collection.update_one(
        {"name": group_name, "posts.content": post_content},
        {"$inc": {"posts.$.likes": 1}}
    )

    if result.modified_count > 0:
        return jsonify({"message": "Post liked successfully!"}), 200
    return jsonify({"error": "Post not found"}), 404


@app.route("/api/comment-post", methods=["POST"])
@jwt_required()
def comment_post():
    data = request.json
    group_name = data.get("group_name")
    post_content = data.get("post_content")
    comment_text = data.get("comment")

    comment = {"user": get_jwt_identity(), "text": comment_text}

    result = groups_collection.update_one(
        {"name": group_name, "posts.content": post_content},
        {"$push": {"posts.$.comments": comment}}
    )

    if result.modified_count > 0:
        return jsonify({"message": "Comment added successfully!"}), 200
    return jsonify({"error": "Post not found"}), 404


@app.route("/api/get-group-posts/<group_name>", methods=["GET"])
@jwt_required()
def get_group_posts(group_name):
    user = get_jwt_identity()
    group = groups_collection.find_one({"name": group_name}, {"_id": 0, "members": 1, "posts": 1})

    if not group:
        return jsonify({"error": "Group not found"}), 404

    if user not in group["members"]:
        return jsonify({"error": "You are not a member of this group"}), 403

    return jsonify(group["posts"])


@app.route("/api/get-groups", methods=["GET"])
def get_groups():
    groups = list(groups_collection.find({}, {"_id": 0, "name": 1}))
    return jsonify(groups)

@app.route("/api/get-user-groups", methods=["GET"])
@jwt_required()
def get_user_groups():
    user_email = get_jwt_identity()

    user_groups = list(groups_collection.find({"members": user_email}, {"_id": 0, "name": 1}))

    group_names = [group["name"] for group in user_groups]

    return jsonify({"groups": group_names})


@app.route("/api/log-meal", methods=["POST"])
@jwt_required()
def log_meal():
    try:
        user_email = get_jwt_identity()
        data = request.json

        if "meals" not in data:
            return jsonify({"error": "Missing 'meals' field"}), 400

        meal_entry = {
            "user": user_email,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),  
            "meals": data["meals"],
        }

        db.meal_collection.insert_one(meal_entry)
        return jsonify({"message": "Meal logged successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def load_food_data():
    try:
        file_path = os.path.join(os.getcwd(), "food_database.xlsx")
        print(f"📂 Checking file at: {file_path}")  # Debugging

        if not os.path.exists(file_path):
            print("❌ File not found!")
            return []

        df = pd.read_excel(file_path, engine="openpyxl")
        print("✅ First 5 rows of DataFrame:")
        print(df.head())  # Debugging

        required_columns = ["Calories (kcal)", "Protein (g)", "Carbohydrates (g)", "Fats (g)"]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"❌ Missing columns in Excel: {missing_columns}")
            return []

        food_items = df.to_dict(orient="records")
        print(f"✅ Loaded Food Data: {food_items[:5]}")  
        return food_items

    except Exception as e:
        print(f"⚠ Error loading food database: {e}")
        return []

@app.route("/api/get-logged-meals", methods=["GET"])
@jwt_required()
def get_logged_meals():
    user_email = get_jwt_identity()
    
    meals = list(db.meal_collection.find({"user": user_email}, {"_id": 0}))

    if not meals:
        return jsonify({"message": "No meals logged yet!"}), 200

    food_data = load_food_data()  
    
    food_dict = {item["Food Name"]: item for item in food_data}

    for meal in meals:
        meal["nutrition"] = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fats": 0
        }

        for meal_type, food_list in meal["meals"].items():
            for food in food_list:  # ✅ Iterate through list of foods
                if food in food_dict:
                    meal["nutrition"]["calories"] += food_dict[food]["Calories (kcal)"]
                    meal["nutrition"]["protein"] += food_dict[food]["Protein (g)"]
                    meal["nutrition"]["carbs"] += food_dict[food]["Carbohydrates (g)"]
                    meal["nutrition"]["fats"] += food_dict[food]["Fats (g)"]

    return jsonify({"meals": meals}), 200


@app.route("/api/get-food-items", methods=["GET"])
def get_food_items():
    food_data = load_food_data()  

    food_names = [item["Food Name"] for item in food_data if "Food Name" in item]

    return jsonify({"food_items": food_names})

@app.route("/api/track-progress", methods=["POST"])
@jwt_required()
def track_progress():
    user_email = get_jwt_identity()

    progress = progress_collection.find_one({"user": user_email}) or {"completed_days": 0}
    completed_days = progress["completed_days"] + 1  # ✅ Increment workout days
    achievement_days = completed_days

    badge = None
    if completed_days == 3:
        badge = "🏅 Beginner Badge"
    elif completed_days == 5:
        badge = "🥈 Intermediate Badge"
    elif completed_days == 7:
        badge = "🏆 Advanced Badge"
        completed_days = 0  

    progress_collection.update_one(
        {"user": user_email},
        {"$set": {"completed_days": completed_days, "badge": badge}},
        upsert=True
    )

    if badge:
        achievements_collection.insert_one({
            "user": user_email,
            "title": f"🎖 {badge}",
            "description": f"Congratulations! You've earned the {badge} for completing {achievement_days} workout days!",
            "likes": 0,
            "comments": []
        })

    return jsonify({
        "message": "Workout day recorded!",
        "completed_days": completed_days,
        "badge": badge,
        "redirect": completed_days == 0  
    }), 200

@app.route("/api/get-progress", methods=["GET"])
@jwt_required()
def get_progress():
    user_email = get_jwt_identity()
    progress = progress_collection.find_one({"user": user_email}, {"_id": 0}) or {"completed_days": 0, "badge": None}
    return jsonify(progress)


@app.route("/api/reset-progress", methods=["POST"])
@jwt_required()
def reset_progress():
    user_email = get_jwt_identity()

    progress_collection.update_one(
        {"user": user_email},
        {"$set": {"completed_days": 0, "badge": None}}, 
        upsert=True
    )

    return jsonify({"message": "Progress reset successfully!"}), 200


@app.route("/api/get-fitness-level", methods=["GET"])
@jwt_required()
def get_fitness_level():
    user_email = get_jwt_identity()
    user_data = db.fitness_assessment.find_one({"user": user_email})

    if not user_data:
        return jsonify({"error": "No fitness level found. Please complete the assessment first."}), 400

    return jsonify({"fitness_level": user_data["level"]})

@app.route("/api/workout-plan", methods=["GET"])
@jwt_required()
def get_workout_plan():
    user_email = get_jwt_identity()
    user_data = db.fitness_assessment.find_one({"user": user_email})

    if not user_data:
        return jsonify({"error": "No fitness level found. Please complete the assessment first."}), 400

    fitness_level = user_data["level"]

    workout_plans = {
        "Beginner 🟢": [
            {"day": "Day 1", "workout": "Jumping Jacks x 30 sec, Squats x 10, Push-ups x 5"},
            {"day": "Day 2", "workout": "High Knees x 30 sec, Lunges x 10, Plank x 20 sec"},
            {"day": "Day 3", "workout": "Mountain Climbers x 30 sec, Wall Sit x 20 sec, Crunches x 15"},
            {"day": "Day 4", "workout": "Jogging in Place x 30 sec, Bridges x 10, Shoulder Taps x 10"},
            {"day": "Day 5", "workout": "Burpees x 5, Side Lunges x 10, Plank x 30 sec"},
        ],
        "Intermediate 🟡": [
            {"day": "Day 1", "workout": "Jump Rope x 1 min, Squats x 20, Push-ups x 10"},
            {"day": "Day 2", "workout": "Burpees x 10, Lunges x 15, Plank x 40 sec"},
            {"day": "Day 3", "workout": "Mountain Climbers x 30 sec, Bicycle Crunches x 20, Wall Sit x 30 sec"},
            {"day": "Day 4", "workout": "Jogging x 3 min, Box Jumps x 10, Plank Shoulder Taps x 15"},
            {"day": "Day 5", "workout": "Jump Squats x 15, Bulgarian Split Squats x 10, Plank x 1 min"},
        ],
        "Advanced 🔴": [
            {"day": "Day 1", "workout": "Sprint x 2 min, Push-ups x 30, Squats x 30"},
            {"day": "Day 2", "workout": "Burpees x 20, Pull-ups x 10, Hanging Leg Raises x 15"},
            {"day": "Day 3", "workout": "Box Jumps x 20, Dead Hangs x 30 sec, Dips x 15"},
            {"day": "Day 4", "workout": "Running x 5 min, Power Cleans x 10, Plank Hold x 2 min"},
            {"day": "Day 5", "workout": "Jump Lunges x 20, Front Squats x 15, Push Press x 12"},
        ],
    }

    return jsonify({"workout_plan": workout_plans.get(fitness_level, [])})
@app.route("/api/fitness-assessment", methods=["POST"])
@jwt_required()
def fitness_assessment():
    data = request.json
    user_email = get_jwt_identity()

    try:
        pushups = int(data.get("pushups", 0))
        squats = int(data.get("squats", 0))
        plank_seconds = int(data.get("plank_seconds", 0))

        if pushups < 10 or squats < 10 or plank_seconds < 20:
            level = "Beginner 🟢"
        elif pushups < 20 or squats < 20 or plank_seconds < 40:
            level = "Intermediate 🟡"
        else:
            level = "Advanced 🔴"

        db.fitness_assessment.update_one(
            {"user": user_email},
            {"$set": {"level": level, "data": data}},
            upsert=True
        )

        return jsonify({"message": "Assessment Completed!", "fitness_level": level}), 200

    except ValueError:
        return jsonify({"error": "Invalid input! Please enter numeric values."}), 400

@app.route("/api/post-badge", methods=["POST"])
@jwt_required()
def post_badge():
    try:
        data = request.json
        user_email = get_jwt_identity()
        
        group_name = data.get("group_name")
        badge = data.get("badge")

        if not group_name or not badge:
            return jsonify({"error": "Group name and badge are required!"}), 400

        group = groups_collection.find_one({"name": group_name})
        if not group:
            return jsonify({"error": "Group not found!"}), 404

        post = {
            "user": user_email,
            "content": f"🎉 Earned a new badge: {badge}!",
            "likes": 0,
            "comments": []
        }

        result = groups_collection.update_one({"name": group_name}, {"$push": {"posts": post}})

        if result.modified_count > 0:
            return jsonify({"message": "Badge posted successfully to the group!"}), 201
        return jsonify({"error": "Failed to post badge!"}), 500

    except Exception as e:
        print(f"⚠ Error in /api/post-badge: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)