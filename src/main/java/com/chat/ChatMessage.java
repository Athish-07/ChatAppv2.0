package com.chat;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    private String content;
    private String sender;
    private MessageType type;

    // Server sends the authoritative online count with every JOIN/LEAVE
    private int onlineCount;
}
