package com.studyhub.auth.config;

import com.mongodb.client.model.IndexOptions;
import jakarta.annotation.PostConstruct;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoIndexConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostConstruct
    public void initIndexes() {
        try {
            try {
                mongoTemplate.getDb().getCollection("users").dropIndex("unique_admin_per_department");
            } catch (Exception ignored) {}

            Document keys = new Document("role", 1).append("department", 1);
            IndexOptions options = new IndexOptions()
                    .name("unique_admin_per_department")
                    .unique(true)
                    .partialFilterExpression(new Document("role", "ROLE_ADMIN"));

            mongoTemplate.getDb().getCollection("users").createIndex(keys, options);
        } catch (Exception e) {
            System.err.println("Note on index initialization: " + e.getMessage());
        }
    }
}
