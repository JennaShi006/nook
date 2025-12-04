# nook



## Overview

**nook** is an online platform designed to make it easier for **University of Florida students** to buy and sell dorm furniture and electronics securely within their campus community.

Every semester, many students face challenges during move-out - from donating or disposing of furniture to transporting bulky items home. Social platforms like Facebook Marketplace are commonly used but often lead to issues such as scams and unreliable sellers.

**nook** solves this by providing a **student-verified marketplace** that promotes safety, trust, and sustainability.



## Project Vision

> **For** University of Florida students who want to trade dorm furniture,  
> **our product** is an online trading platform  
> **that allows** students to buy and sell furniture with other verified UF students.  
> **Unlike** Facebook Marketplace,  
> **our product** ensures that furniture is coming from students attending the same university, promoting safety, trust, and community engagement.




## Key Features

- **UF Student Verification System** – ensures all users are verified UF students  
- **User Ratings & Reviews** – promotes trust and accountability  
- **In-App Chat** – allows buyers and sellers to communicate securely  
- **Image Uploads & Filters** – users can browse listings efficiently  
- **Sustainability Focus** – encourages furniture reuse and waste reduction  





## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend (Presentation)** | React.js, HTML, CSS, JavaScript |
| **Backend (Application)** | Node.js, Express.js |
| **Database (Data)** | MongoDB (via Mongoose) |
| **Architecture** | 3-Tier (Presentation / Application / Data) |

## Development Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/JennaShi006/nook.git
cd nook
```

### 2. Backend Setup
```bash
cd backend
npm install
cd ..
```

### 3. Frontend Setup
```bash
cd frontend
npm install
Cd ..
```

### 4. Run
```bash
npm start
```

### Backend Environment Variables (.env Format)
```bash
PORT=5000
MONGO_URI=mongodb+srv://winnie_lin_56:VG4Lu3wcMLbU5ryR@nook.0jqzyit.mongodb.net/Nook?retryWrites=true&w=majority&appName=nook
JWT_SECRET=YYUtdFWHzCvAR5SVJTt+yRS52wOdm6BcnQ+LOkz7+jU=
EMAIL_USER=ufnook@gmail.com 
EMAIL_PASS=cfqagjwosbcykcvs
CLIENT_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
IMGBB_API_KEY=23e2d879d6a0d28523e4a0105e721d71
ADMIN_CODE=admincode1234
```

### Frontend Environment Variables (.env Format)
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PORT=5000
```
