# 🛡️ PhishGuard AI

An AI-powered phishing detection platform that analyzes URLs and identifies potential threats in real-time.
Built using **Python (FastAPI)** for backend intelligence and **React (TypeScript)** for an interactive frontend dashboard.

---

## 🚀 Features

* 🔍 Real-time URL phishing detection
* 🤖 Machine Learning-based threat analysis
* 📊 Awareness score and risk classification
* 📁 Scan history tracking
* 📤 Data export (CSV)
* 🎯 Clean and interactive dashboard UI

---

## 🛠️ Tech Stack

### 🔹 Backend

* Python
* FastAPI
* SQLAlchemy
* Machine Learning (custom detection logic)

### 🔹 Frontend

* React
* TypeScript
* Tailwind CSS

---

## 📂 Project Structure

```
phishguard/
│
├── backend/        # FastAPI backend
├── frontend/       # React frontend
├── assets/         # Screenshots
├── README.md
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 📌 1. Clone the Repository

```
git clone https://github.com/snehxa27/phishguard-ai.git
cd phishguard-ai
```

---

## 🖥️ Backend Setup (Python)

```
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
# venv\Scripts\activate    # Windows

pip install -r requirements.txt
```

### ▶️ Run Backend Server

```
uvicorn main:app --reload
```

👉 Backend runs on:
http://127.0.0.1:8000

---

## 🌐 Frontend Setup (React)

```
cd frontend
npm install
```

### ▶️ Run Frontend

```
npm start
```

👉 Frontend runs on:
http://localhost:3000

---

## 🔗 How It Works

1. User enters a URL
2. Backend analyzes URL using detection logic
3. ML model evaluates phishing probability
4. System generates:

   * Risk score
   * Explanation
   * Threat classification
5. Results displayed in dashboard

---

## 🔮 Future Improvements

* Chrome Extension for real-time email scanning
* Integration with VirusTotal API
* Real-time threat intelligence
* Deployment (AWS / Docker)
* Advanced ML models

---

## 👩‍💻 Author

**Sneha Karande**
Aspiring Data Scientist | AI & Cybersecurity Enthusiast

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!

