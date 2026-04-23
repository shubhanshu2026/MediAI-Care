<div align="center">
  <h1>🩺 MediAI-Care</h1>
  <p><strong>AI-Powered Healthcare Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
  [![Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

## 🌟 About The Project

**MediAI-Care** is a comprehensive, intelligent healthcare solution that leverages Artificial Intelligence to deliver predictive medical insights, actionable precaution recommendations, and in-depth symptom analysis. Designed with a user-first approach, it bridges the gap between raw medical data and meaningful health guidance.

---

## 🏗️ Project Architecture

Our platform is structured into three robust micro-components:

### 🎨 1. Frontend (`medi-ai-care-front-main`)
A sleek, responsive, and highly interactive user interface built for modern web browsers.
* **🛠️ Tech Stack:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
* **✨ Highlights:** 
  * Intuitive and dynamic user dashboards
  * Real-time symptom input & analysis forms
  * Personalized AI-driven health recommendations

### ⚙️ 2. Backend API (`medi-ai-care/backend`)
The powerhouse of the application that handles complex business logic, secures user data, and orchestrates communication between the frontend and our AI services.
* **🛠️ Tech Stack:** Java, Spring Boot, Maven
* **✨ Highlights:** 
  * RESTful architecture with secure endpoints
  * Efficient data processing and persistent storage
  * Seamless integration with the Python AI microservice

### 🧠 3. AI Inference Service (`medi-ai-care/ai_service`)
The cognitive engine that powers our predictive healthcare features.
* **🛠️ Tech Stack:** Python, Pandas, Scikit-learn
* **✨ Highlights:** 
  * 🩺 Predicts potential diseases from user-reported symptoms.
  * 💊 Suggests tailored medications, diets, workouts, and precautions.
  * 📊 Trained on comprehensive healthcare datasets (e.g., `Symptom-severity.csv`, `Training.csv`, `Disease precaution.csv`).

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 📋 Prerequisites

Ensure you have the following installed:
* **Frontend:** [Node.js](https://nodejs.org/) (v18+) and npm
* **Backend:** [Java JDK](https://www.oracle.com/java/technologies/javase-downloads.html) (17+) and Maven
* **AI Service:** [Python](https://www.python.org/downloads/) (3.8+)

### 💻 Installation & Setup

#### 1️⃣ Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd medi-ai-care-front-main
npm install
npm run dev
```

#### 2️⃣ Backend Setup
Navigate to the backend directory and launch the Spring Boot application:
```bash
cd medi-ai-care/backend
./mvnw spring-boot:run
```

#### 3️⃣ AI Service Setup
Navigate to the AI service directory, install the required packages, and run the Python server:
```bash
cd medi-ai-care/ai_service
pip install -r requirements.txt
python app.py
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>Made with ❤️ by the MediAI-Care Team</p>
</div>
