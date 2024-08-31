import os, pandas as pd, numpy as np
from sklearn.preprocessing import StandardScaler
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

app = FastAPI()

@app.get("/")
def read_root():
    data_cursor = collection.find()
    data = list(data_cursor)
    
    dataset = pd.DataFrame(data)
    
    if '_id' in dataset.columns:
        dataset.drop('_id', axis=1, inplace=True)
    
    if 'username' not in dataset.columns:
        raise ValueError("Username column is missing from the dataset")
    
    dataset = dataset.dropna(subset=['username']).copy()

    numeric_columns = dataset.select_dtypes(include=[np.number]).columns
    dataset.loc[:, numeric_columns] = dataset[numeric_columns].fillna(dataset[numeric_columns].mean())
    
    X = pd.get_dummies(dataset.drop('username', axis=1))
    
    sc = StandardScaler()
    X_normalized = sc.fit_transform(X)
    
    num_features = X_normalized.shape[1]
    weights = np.ones(num_features)  # Example: Assign equal weight to all features
    
    weighted_scores = np.dot(X_normalized, weights)

    min_weighted_score = np.min(weighted_scores)
    max_weighted_score = np.max(weighted_scores)
    
    desired_min = 40
    desired_max = 100
    
    scores = (weighted_scores - min_weighted_score) / (max_weighted_score - min_weighted_score)
    scores = scores * (desired_max - desired_min) + desired_min
    
    usernames = dataset['username']
    user_scores = {user: score for user, score in zip(usernames, scores)}
    
    print(user_scores)

    return "customer score"