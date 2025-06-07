package com.example.ClientManagement.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class KafkaFileConsumer {

    private static final String LOG_DIR = "kafka-logs";
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @KafkaListener(topics = {"client-events", "contact-events"})
    public void consumeAndSaveToFile(String message,
                                     @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                     @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                                     @Header(KafkaHeaders.OFFSET) long offset) {
        try {
            // Create directory if it doesn't exist
            Files.createDirectories(Paths.get(LOG_DIR));

            // Create filename with date
            String filename = String.format("%s/%s-%s.txt",
                    LOG_DIR,
                    topic,
                    LocalDate.now()
            );

            // Create detailed log entry
            String logEntry = String.format(
                    "[%s] Topic: %s | Partition: %d | Offset: %d%nMessage: %s%n%s%n",
                    LocalDateTime.now().format(TIMESTAMP_FORMAT),
                    topic,
                    partition,
                    offset,
                    message,
                    "=".repeat(80)
            );

            // Write to file (append mode)
            Files.write(
                    Paths.get(filename),
                    logEntry.getBytes(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );

            // Console log for immediate feedback
            System.out.println("✅ Saved to file: " + filename);
            System.out.println("📝 Message: " + message);

        } catch (IOException e) {
            System.err.println("❌ Failed to write to file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Optional: Separate listener for just monitoring
    @KafkaListener(topics = {"client-events", "contact-events"}, groupId = "monitor-group")
    public void monitorMessages(String message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        System.out.println(String.format("🔍 [MONITOR] %s: %s", topic, message));
    }
}