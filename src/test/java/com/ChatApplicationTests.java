package com;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "server.port=0")
class ChatApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring context starts without errors.
        // Add integration tests using WebSocketStompClient for full coverage.
    }
}
