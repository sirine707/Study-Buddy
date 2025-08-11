# Ensuite - Study Buddy

## Project Overview

Ensuite - Study Buddy is a full-stack web application designed to enhance collaborative learning. It combines a robust Django backend with a modern React frontend, providing tools for study session management, interactive chat, AI-powered summarization, notes and quiz generation, and secure user and payment management. The platform supports real-time communication and offers a responsive user experience across devices.

## Technologies Used

**Backend:**

- Python 3.10+
- Django 4.1
- Django REST Framework
- PostgreSQL
- Ollama (local LLM support)
- Channels (real-time features)
- Localflavor (locale-specific validation)
- django-user-agents (device detection)
- CORS Headers (cross-origin requests)
- Stripe (payment integration, optional)

**Frontend:**

- Node.js v18.20.5
- Yarn (dependency management)
- React (JSX)
- Vite (build tool)
- HTML/CSS (layout and styling)

## Key Features

- **User Registration, Login, and Profile Management**
- **Study Session Creation and Management**
- **Real-Time Chat Messaging Between Users**
- **Summarize Study Materials Using AI**
- **Generate and Organize Notes**
- **Quiz Creation with Multiple Tones** (flashcards, multiple choice, conversational)
- **Retrieve Device and Browser Information**
- **Stripe Payment Processing Endpoints**
- **Email Notification Triggers**
- **Admin Endpoints for Managing Users and Sessions**

---

## Prerequisites

### Backend

- Python 3.10.11 or compatible version
  - [Download Python](https://www.python.org/downloads/)
- Ollama for local LLM support
  - [Download Ollama](https://ollama.com/download)
  - Required models: llama3.1:8b

### Frontend

- Node.js v18.20.5 or compatible version
  - [Download Node.js](https://nodejs.org/en/download)
  - Or use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

---

## Getting Started

### Backend Setup

1. Install Ollama:
   - Download and install from [ollama.com](https://ollama.com/download)
2. Pull required LLM model:
   ```bash
   ollama pull llama3.1
   ```
3. Verify model installation:
   ```bash
   ollama list
   # Should show llama3.1:8b in the list
   ```
4. Check Python version:
   ```bash
   python3 --version
   # Should show Python 3.10.11 or compatible version
   ```
5. Set up Python environment:
   ```bash
   # Create virtual environment
   virtualenv .venv
   # Activate virtual environment
   source .venv/bin/activate
   # Install dependencies
   pip3 install -r requirements.txt
   ```
6. Run the development server:
   ```bash
   python3 manage.py runserver
   ```
   The API will be available at <http://localhost:8000/>.
7. When finished, deactivate the virtual environment:
   ```bash
   deactivate
   ```

### Frontend Setup

1. Check your Node.js version:
   ```bash
   node --version
   # Expected output: v18.20.5 or compatible version
   ```
2. Install dependencies:
   ```bash
   yarn
   ```
3. Start the development server:
   ```bash
   yarn dev
   ```
   The frontend will be available at <http://localhost:5173/>.

When opened, a similar page should appear:

<img width="600" alt="screenshot" src="https://github.com/user-attachments/assets/a6dc7cc0-5876-4762-9672-15876766ed41" />