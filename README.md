📱 WhatsApp Clone (Demo)

A WhatsApp Web–like interface built with React (frontend) and Node.js + Express + MongoDB (backend).
This project demonstrates real-time chat UI, conversation grouping, and sending demo messages that are saved in the database.

🚀 Features

WhatsApp Web–like clean and responsive UI
Show all conversations grouped by user (wa_id)
Chat window with:
-Message bubbles with timestamps
-Status indicators (sent, delivered, read – demo only)
-Basic user info (name and number)
Send Message Demo:
-Input box to send a new message
-Message instantly appears in UI
-Saved to database (processed_messages)
-No real WhatsApp API call (demo only)

🛠️ Tech Stack

Frontend:
React (Vite)
Axios (API calls)
Socket.io-client

Backend:
Node.js + Express
MongoDB + Mongoose
Socket.io
dotenv, uuid
