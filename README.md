# 💬 chatApp v2.0

A real-time chat application built with **Spring Boot** and **WebSocket**. No login, no account — just pick a username and start chatting instantly.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen?style=flat-square)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP%20%2B%20SockJS-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

- ⚡ Real-time messaging via WebSocket (STOMP + SockJS)
- 👥 Live online user count (server-side, accurate for all users)
- 💬 Message bubbles — your messages on the right, others on the left
- 🕐 Timestamps on every message
- 📅 Date dividers between sessions
- 👤 Color-coded avatars per user
- 🔒 XSS protection — all user input sanitized on server
- 📱 Fully responsive — works on mobile and desktop
- 🌐 Works on Chrome, Edge, Firefox, Brave, Safari

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.5.5 |
| WebSocket | Spring WebSocket, STOMP, SockJS 1.6.1 |
| Frontend | Vanilla JS, HTML5, CSS3 |
| Font | Plus Jakarta Sans (Google Fonts) |
| Build | Maven |
| Deploy | Docker, Render.com |

---

## 🚀 Running Locally

### Prerequisites
- Java 17+
- Maven (or use the included `mvnw` wrapper)
- IntelliJ IDEA (or any IDE)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/chatapp.git
cd chatapp
```

**2. Run the application**
```bash
./mvnw spring-boot:run
```
Or open in IntelliJ and run `ChatApplication.java`

**3. Open in browser**
```
http://localhost:9080
```

**4. Test the chat**

Open two browser tabs, enter different usernames in each, and chat between them in real time.

---

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/
│   │   ├── ChatApplication.java          # Spring Boot entry point
│   │   ├── chat/
│   │   │   ├── ChatController.java       # WebSocket message handlers
│   │   │   ├── ChatMessage.java          # Message model (content, sender, type, onlineCount)
│   │   │   └── MessageType.java          # Enum: CHAT, JOIN, LEAVE
│   │   └── config/
│   │       ├── WebSocketConfig.java      # WebSocket + SockJS endpoint config
│   │       ├── WebSocketEventListener.java # Handles disconnect events
│   │       └── WebConfig.java            # Static file serving config
│   └── resources/
│       ├── application.properties        # Server config
│       └── static/
│           ├── index.html                # Main UI (CSS inlined)
│           ├── js/main.js                # Frontend WebSocket logic
│           └── css/main.css              # Styles
```

---

## ⚙️ How It Works

```
Browser  ──SockJS/WSS──▶  Spring Boot  ──STOMP──▶  /topic/public
                                │
                         ConcurrentHashMap
                         (online user set)
```

1. User enters username → browser connects via **SockJS** to `/ws-sockjs`
2. Spring upgrades the HTTP connection to a **WebSocket**
3. Client subscribes to `/topic/public` and sends a `JOIN` message
4. Server adds user to the online set, broadcasts **JOIN + online count** to all
5. Every message goes through **server-side sanitization** before broadcast
6. On disconnect, server removes user, broadcasts **LEAVE + updated count**

---

## 🌍 Deploying to Render (Free)

### Prerequisites
- GitHub account
- Render account (free at render.com)

### Steps

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/chatapp.git
git push -u origin main
```

**2. Deploy on Render**
1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Runtime:** Docker (auto-detected from Dockerfile)
   - **Instance Type:** Free
4. Click **Create Web Service**
5. Wait ~4 minutes for build → your app is live at `https://chatapp-xxxx.onrender.com`

### How Render deployment works
Render runs behind an HTTPS reverse proxy. This app handles that with:
- `server.forward-headers-strategy=NATIVE` — trusts `X-Forwarded-Proto` header
- `ForwardedHeaderFilter` bean — processes proxy headers before WebSocket upgrade
- SockJS absolute URL — ensures `wss://` is used on HTTPS automatically

> **Note:** Render free tier sleeps after 15 minutes of inactivity. First visit after sleep takes ~30 seconds to wake up.

---

## 🔧 Configuration

### `application.properties`

```properties
# Port — Render injects $PORT automatically, localhost defaults to 9080
server.port=${PORT:9080}

# Required for Render reverse proxy
server.forward-headers-strategy=NATIVE
```

### Changing the default port (localhost only)
Edit `application.properties`:
```properties
server.port=${PORT:YOUR_PORT}
```

---

## 🔒 Security Notes

- All user input (usernames and messages) is **HTML-escaped** server-side before broadcast
- Duplicate usernames are handled via `ConcurrentHashMap`-backed Set (deduplicates automatically)
- Username max length: **30 characters** (enforced on both client and server)
- Message max length: **500 characters** (enforced on client with live counter)
- CORS: `setAllowedOriginPatterns("*")` — restrict to your domain in production

---

## 📸 Screenshots

| Login Page | Chat Page |

<img width="1914" height="910" alt="image" src="https://github.com/user-attachments/assets/9f8515e0-7226-43c6-adba-fb7320e9ba5f" />

<img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/4a1eeca1-458d-4b01-a09e-de68646005d2" />

| Glassmorphism login card with gradient background | Real-time chat with message bubbles, online counter, timestamps |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "add my feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

Built with ❤️ by **Athish**
