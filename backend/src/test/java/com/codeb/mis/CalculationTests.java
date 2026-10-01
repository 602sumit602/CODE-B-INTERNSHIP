package com.codeb.mis;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculationTests {

    @Test
    void testGstAndInvoiceCalculations() {
        // Line 1: 10 items @ 8000 = 80000, discount 5000 = 75000 taxable
        BigDecimal qty1 = BigDecimal.valueOf(10);
        BigDecimal price1 = new BigDecimal("8000.00");
        BigDecimal disc1 = new BigDecimal("5000.00");
        BigDecimal taxable1 = price1.multiply(qty1).subtract(disc1);
        assertEquals(new BigDecimal("75000.00"), taxable1);

        // Line 2: 5 items @ 14000 = 70000, discount 5000 = 65000 taxable
        BigDecimal qty2 = BigDecimal.valueOf(5);
        BigDecimal price2 = new BigDecimal("14000.00");
        BigDecimal disc2 = new BigDecimal("5000.00");
        BigDecimal taxable2 = price2.multiply(qty2).subtract(disc2);
        assertEquals(new BigDecimal("65000.00"), taxable2);

        // Subtotal & Taxable total
        BigDecimal totalTaxable = taxable1.add(taxable2);
        assertEquals(new BigDecimal("140000.00"), totalTaxable);

        // GST @ 18%
        BigDecimal gstRate = new BigDecimal("18.00");
        BigDecimal gst = totalTaxable.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        assertEquals(new BigDecimal("25200.00"), gst);

        // Grand total
        BigDecimal grandTotal = totalTaxable.add(gst);
        assertEquals(new BigDecimal("165200.00"), grandTotal);

        // Partial payment 80,000 -> balance 85,200
        BigDecimal payment = new BigDecimal("80000.00");
        BigDecimal balance = grandTotal.subtract(payment);
        assertEquals(new BigDecimal("85200.00"), balance);
    }
}
