package com.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final Set<String> onlineUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public ChatController(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        if (chatMessage.getSender() == null || chatMessage.getSender().isBlank()) return;
        if (chatMessage.getContent() == null || chatMessage.getContent().isBlank()) return;

        chatMessage.setContent(sanitize(chatMessage.getContent()));
        chatMessage.setSender(sanitize(chatMessage.getSender()));
        chatMessage.setOnlineCount(onlineUsers.size());

        messagingTemplate.convertAndSend("/topic/public", chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage,
                        SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        if (username == null || username.isBlank()) return;
        if (username.length() > 30) return;

        String sanitized = sanitize(username.trim());
        headerAccessor.getSessionAttributes().put("username", sanitized);
        onlineUsers.add(sanitized);

        // Build JOIN message with accurate count AFTER adding user
        ChatMessage joinMsg = ChatMessage.builder()
                .type(MessageType.JOIN)
                .sender(sanitized)
                .onlineCount(onlineUsers.size())
                .build();

        // Broadcast to ALL subscribers including the sender
        messagingTemplate.convertAndSend("/topic/public", joinMsg);
    }

    public void removeUser(String username) {
        onlineUsers.remove(username);
    }

    public int getOnlineCount() {
        return onlineUsers.size();
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
