import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# 1. LOAD DATASETS (Using the files shown in your screenshot)
training_df = pd.read_csv('Training.csv')
description_df = pd.read_csv('description.csv')
precaution_df = pd.read_csv('precautions_df.csv')
medication_df = pd.read_csv('medications.csv')
diet_df = pd.read_csv('diets.csv')
workout_df = pd.read_csv('workout_df.csv')

# Clean column names
training_df.columns = [col.strip() for col in training_df.columns]

# 2. TRAIN THE MODEL
# This dataset is small enough to train instantly on your laptop
X = training_df.drop('prognosis', axis=1)
y = training_df['prognosis']
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)
symptom_list = X.columns.values

@app.route('/predict', methods=['POST'])
def predict():
    raw_input = request.json.get('symptoms', '')
    # Standardize input text
    user_text = raw_input.lower().replace(',', ' ').replace('.', ' ').strip()
    
    input_vector = [0] * len(symptom_list)
    detected_list = []

    # 3. MATCHING LOGIC
    # Maps user words to CSV columns (e.g., 'fever' -> 'high_fever')
    for i, symptom in enumerate(symptom_list):
        underscore_name = symptom.lower().strip()
        space_name = underscore_name.replace('_', ' ')

        if space_name in user_text or underscore_name in user_text:
            input_vector[i] = 1
            detected_list.append(symptom)

    if sum(input_vector) == 0:
        return jsonify({"error": "No symptoms recognized. Try common terms like 'fever' or 'cough'."}), 400

    # 4. PREDICTION
    prediction = model.predict([input_vector])[0].strip()

    # 5. DATASET LOOKUPS (Pulling from your specific CSV files)
    desc = description_df[description_df['Disease'] == prediction]['Description'].values[0] if prediction in description_df['Disease'].values else "N/A"
    
    prec = []
    if prediction in precaution_df['Disease'].values:
        prec = precaution_df[precaution_df['Disease'] == prediction].iloc[0, 1:].dropna().tolist()
    
    meds = medication_df[medication_df['Disease'] == prediction]['Medication'].values[0] if prediction in medication_df['Disease'].values else "Consult doctor."
    diet = diet_df[diet_df['Disease'] == prediction]['Diet'].values[0] if prediction in diet_df['Disease'].values else "Balanced diet."
    workout = workout_df[workout_df['disease'] == prediction]['workout'].values[0] if prediction in workout_df['disease'].values else "Rest as needed."

    return jsonify({
        "disease": prediction,
        "description": desc,
        "precautions": prec,
        "medications": meds,
        "diet": diet,
        "workout": workout,
        "detected_symptoms": detected_list
    })

if __name__ == '__main__':
    print("AI Service running on port 5000 with Training.csv...")
    app.run(port=5000, debug=True)