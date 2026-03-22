# LegisAid: AI Legislative Analyzer

LegisAid is an AI-powered legislative analysis tool designed to simplify complex legal documents and provide actionable insights. It helps users quickly understand bills, policies, and legal texts through structured summaries, analysis, and interactive exploration. This project is a standalone tool to be used via the deployed render link. It uses NLP-based AI analysis and interpretation of uploaded document alongside the lightweight compression supported by Scaledown AI. Developed as a submission for GEN AI FOR GENZ supported by Intel Unnati Program.

## Features

* **Smart Summarization** – Generates concise summaries of lengthy legislative documents
* **Simplified Explanation** – Converts complex legal jargon into easy-to-understand language
* **Pros & Cons Analysis** – Highlights advantages and potential drawbacks
* **Headline Generation** – Creates clear, impactful headlines for documents
* **Keyword Extraction** – Identifies important terms and topics
* **Compression Engine** – Uses ScaleDown API for efficient text compression
* **Risk Assessment** – Assigns risk scores based on content analysis
* **Impact Scoring** – Evaluates the potential societal and policy impact
* **AI Chatbot** – Interactive assistant for querying and understanding legislation

---

## Steps to use the tool

1. Input a legislative document or text
2. The system processes it using AI models
3. Multiple analytical layers are applied:

   * Summarization
   * Simplification
   * Sentiment & impact analysis
   * Risk evaluation
4. Outputs are presented in a structured and user-friendly format
5. Users can further interact via the chatbot

---

##  Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Python / FastAPI
* **AI Models:** NLP-based processing
* **Compression:** ScaleDown API

---


## What output to expect:

* Summary
* Simplified Explanation
* Pros & Cons
* Headline
* Keywords
* Compressed Version
* Risk Score
* Impact Score

---
## How to access on your server:

```bash

git clone https://github.com/Abhiroop001/Triple_A_AI_Legislative_Analyzer
cd legisaid

//for backend

cd backend
pip install -r requirements.txt
python runthis.py

//for frontend

cd frontend
npm i
npm run dev

```

---

##  Acknowledgements

* ScaleDown API for text compression
* Open-source NLP tools and libraries


