'use strict';

var usernamePage     = document.querySelector('#username-page');
var chatPage         = document.querySelector('#chat-page');
var usernameForm     = document.querySelector('#usernameForm');
var messageForm      = document.querySelector('#messageForm');
var messageInput     = document.querySelector('#message');
var messageArea      = document.querySelector('#messageArea');
var connectingBanner = document.querySelector('#connectingBanner');
var headerStatus     = document.querySelector('#headerStatus');
var onlineCountEl    = document.querySelector('#onlineCount');
var youAvatar        = document.querySelector('#youAvatar');
var charCount        = document.querySelector('#charCount');

var stompClient = null;
var username    = null;
var lastSender  = null;
var lastDate    = null;

var colors = ['#6c63ff','#e85d9f','#f97316','#0ea5e9','#22c55e','#a855f7','#ef4444','#14b8a6'];

/* ── CHARACTER COUNTER ── */
messageInput.addEventListener('input', function() {
    var len = messageInput.value.length;
    var remaining = 500 - len;
    if (remaining <= 50) {
        charCount.textContent = remaining;
        charCount.className = remaining <= 10 ? 'limit' : 'warn';
    } else {
        charCount.textContent = '';
        charCount.className = '';
    }
});

/* ── CONNECT ── */
function connect(event) {
    event.preventDefault();
    username = document.querySelector('#name').value.trim();
    if (!username) return;
    if (username.length > 30) { alert('Username must be 30 characters or fewer.'); return; }

    youAvatar.textContent = username[0].toUpperCase();
    youAvatar.style.background = getAvatarColor(username);

    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    // Always use SockJS — it works on localhost (http) AND Render (https)
    // SockJS internally uses wss:// when the page is on https://
    // No native WebSocket fallback needed — SockJS handles everything
    var sockjsUrl = window.location.protocol + '//' + window.location.host + '/ws-sockjs';
    var socket = new SockJS(sockjsUrl);
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, onConnected, onError);
}

/* ── CONNECTED ── */
function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);
    setTimeout(function() {
        stompClient.send('/app/chat.addUser', {}, JSON.stringify({
            sender: username, type: 'JOIN'
        }));
    }, 150);
    connectingBanner.classList.add('hidden');
    headerStatus.textContent = 'Connected';
    headerStatus.classList.add('connected');
}

/* ── ERROR ── */
function onError() {
    connectingBanner.classList.remove('hidden');
    connectingBanner.textContent = 'Could not connect. Please refresh and try again.';
    connectingBanner.style.background = '#fef2f2';
    connectingBanner.style.borderColor = '#fecaca';
    connectingBanner.style.color = '#dc2626';
    headerStatus.textContent = 'Disconnected';
    headerStatus.classList.remove('connected');
}

/* ── SEND ── */
function sendMessage(event) {
    event.preventDefault();
    var content = messageInput.value.trim();
    if (content && stompClient) {
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({
            sender: username, content: content, type: 'CHAT'
        }));
        messageInput.value = '';
        charCount.textContent = '';
        charCount.className = '';
    }
}

/* ── RECEIVE ── */
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    if (message.onlineCount !== undefined && message.onlineCount > 0) {
        onlineCountEl.textContent = message.onlineCount;
    }

    var now = new Date();
    var li = document.createElement('li');

    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        lastSender = null;
        li.classList.add('event-message');
        var p = document.createElement('p');
        p.textContent = message.type === 'JOIN'
            ? '👋 ' + message.sender + ' joined'
            : '👋 ' + message.sender + ' left';
        li.appendChild(p);

    } else {
        var isOwn = message.sender === username;

        var dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        if (dateStr !== lastDate) {
            lastDate = dateStr;
            var divider = document.createElement('li');
            divider.classList.add('date-divider');
            divider.innerHTML = '<span>' + dateStr + '</span>';
            messageArea.appendChild(divider);
        }

        var isSameSender = (message.sender === lastSender);
        lastSender = message.sender;

        li.classList.add('chat-message');
        if (isOwn) li.classList.add('own-message');
        if (isSameSender) li.classList.add('same-sender');

        var avatar = document.createElement('i');
        avatar.textContent = (message.sender && message.sender.length > 0)
            ? message.sender[0].toUpperCase() : '?';
        avatar.style.background = getAvatarColor(message.sender || '');

        var wrap = document.createElement('div');
        wrap.classList.add('bubble-wrap');

        if (!isOwn && !isSameSender) {
            var nameEl = document.createElement('span');
            nameEl.className = 'sender-name';
            nameEl.textContent = message.sender;
            wrap.appendChild(nameEl);
        }

        var bubble = document.createElement('p');
        bubble.textContent = message.content;
        wrap.appendChild(bubble);

        var meta = document.createElement('div');
        meta.className = 'msg-meta';
        meta.textContent = formatTime(now);
        if (isOwn) {
            var tick = document.createElement('span');
            tick.className = 'tick';
            tick.textContent = ' ✓';
            meta.appendChild(tick);
        }
        wrap.appendChild(meta);

        li.appendChild(avatar);
        li.appendChild(wrap);
    }

    messageArea.appendChild(li);
    messageArea.scrollTop = messageArea.scrollHeight;
}

/* ── HELPERS ── */
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAvatarColor(sender) {
    var hash = 0;
    for (var i = 0; i < sender.length; i++) hash = 31 * hash + sender.charCodeAt(i);
    return colors[Math.abs(hash % colors.length)];
}

/* ── EVENTS ── */
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        messageForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        e.preventDefault();
    }
});
