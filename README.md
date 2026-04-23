# MediAI-Care

MediAI-Care is a comprehensive healthcare solution that leverages Artificial Intelligence to provide medical insights, disease predictions, precaution recommendations, and symptom analysis.

## Project Structure

This repository is organized into three main components:

### 1. Frontend (`medi-ai-care-front-main`)
A modern, responsive, and intuitive user interface built to seamlessly interact with the backend APIs.
- **Technologies:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui.
- **Key Features:** User-friendly dashboards, symptom input forms, and personalized AI-driven healthcare recommendations.

### 2. Backend (`medi-ai-care/backend`)
The core RESTful API server that handles business logic, orchestrates data flow, and connects the frontend with the AI models.
- **Technologies:** Java, Spring Boot, Maven.
- **Key Features:** Secure endpoints, data processing, and integration with the Python AI microservice.

### 3. AI Service (`medi-ai-care/ai_service`)
The machine learning engine responsible for health predictions based on datasets.
- **Technologies:** Python, Pandas, Scikit-learn (assumed).
- **Key Features:** 
  - Predicts potential diseases from user symptoms.
  - Suggests medications, diets, workouts, and precautions.
  - Relies on several rich healthcare datasets (e.g., `Symptom-severity.csv`, `Training.csv`, `Disease precaution.csv`).

## Getting Started

### Prerequisites
- **Frontend:** Node.js (v18+) and npm
- **Backend:** Java (JDK 17+) and Maven
- **AI Service:** Python 3.8+

### Installation & Setup

#### Frontend
```bash
cd medi-ai-care-front-main
npm install
npm run dev
```

#### Backend
```bash
cd medi-ai-care/backend
./mvnw spring-boot:run
```

#### AI Service
```bash
cd medi-ai-care/ai_service
pip install -r requirements.txt # (if applicable)
python app.py
```

## Contributing
Feel free to open issues and pull requests to help improve MediAI-Care.

## License
This project is open-source and available under the [MIT License](LICENSE).
