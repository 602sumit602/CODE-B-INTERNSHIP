package com.codeb.mis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subzones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subzone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subzone_id")
    private Long subzoneId;

    @Column(name = "subzone_name", nullable = false, unique = true, length = 100)
    private String subzoneName;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        ACTIVE,
        INACTIVE
    }
}
