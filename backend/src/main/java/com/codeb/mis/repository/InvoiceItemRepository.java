package com.codeb.mis.repository;

import com.codeb.mis.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByInvoiceInvoiceId(Long invoiceId);
    void deleteByInvoiceInvoiceId(Long invoiceId);
}
