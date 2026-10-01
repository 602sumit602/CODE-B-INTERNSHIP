package com.codeb.mis.config;

import com.codeb.mis.entity.*;
import com.codeb.mis.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ChainRepository chainRepository;
    private final BrandRepository brandRepository;
    private final SubzoneRepository subzoneRepository;
    private final ClientRepository clientRepository;
    private final EstimateRepository estimateRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final SystemSettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initSettings();
        initUsers();
        initHierarchyAndClients();
        initEstimatesAndInvoices();
    }

    private void initSettings() {
        if (!settingRepository.existsById("default_gst_rate")) {
            settingRepository.save(SystemSetting.builder()
                    .settingKey("default_gst_rate")
                    .settingValue("18.00")
                    .description("Default Goods and Services Tax percentage")
                    .build());
        }
        if (!settingRepository.existsById("company_name")) {
            settingRepository.save(SystemSetting.builder()
                    .settingKey("company_name")
                    .settingValue("Code-B Solutions Pvt Ltd")
                    .description("Organization Name")
                    .build());
        }
        if (!settingRepository.existsById("company_gstin")) {
            settingRepository.save(SystemSetting.builder()
                    .settingKey("company_gstin")
                    .settingValue("27AABCC9988K1Z5")
                    .description("Company Registered GST Identification Number")
                    .build());
        }
        logger.info("System settings initialized.");
    }

    private void initUsers() {
        // Ensure standard demo users with known BCrypt passwords
        createUserIfNotExists("admin@codeb.com", "Administrator", "admin123", User.Role.ADMIN, User.Status.ACTIVE, "+91 98765 43210", "Executive");
        createUserIfNotExists("john.sales@codeb.com", "John Doe", "sales123", User.Role.SALES_PERSON, User.Status.ACTIVE, "+91 98200 11223", "West Zone Sales");
        createUserIfNotExists("sarah.sales@codeb.com", "Sarah Jenkins", "sales123", User.Role.SALES_PERSON, User.Status.ACTIVE, "+91 98111 22334", "North Zone Sales");
        createUserIfNotExists("michael.sales@codeb.com", "Michael Chang", "sales123", User.Role.SALES_PERSON, User.Status.ACTIVE, "+91 98333 44556", "South Zone Sales");
        createUserIfNotExists("inactive@codeb.com", "Inactive User", "sales123", User.Role.SALES_PERSON, User.Status.INACTIVE, "+91 98000 00000", "Operations");
        logger.info("Demo users initialized.");
    }

    private void createUserIfNotExists(String email, String name, String password, User.Role role, User.Status status, String phone, String dept) {
        userRepository.findByEmail(email).ifPresentOrElse(
                u -> {
                    // Update password hash to guarantee match
                    u.setPasswordHash(passwordEncoder.encode(password));
                    userRepository.save(u);
                },
                () -> {
                    User u = User.builder()
                            .fullName(name)
                            .email(email)
                            .passwordHash(passwordEncoder.encode(password))
                            .role(role)
                            .status(status)
                            .phone(phone)
                            .department(dept)
                            .build();
                    userRepository.save(u);
                }
        );
    }

    private void initHierarchyAndClients() {
        if (groupRepository.count() == 0) {
            Group g1 = groupRepository.save(Group.builder().groupName("Retail Hub India").description("Pan-India conglomerate specializing in retail and logistics").status(Group.Status.ACTIVE).build());
            Group g2 = groupRepository.save(Group.builder().groupName("Metro Hospitality Group").description("Luxury hotels, business stays, and quick-service diners").status(Group.Status.ACTIVE).build());
            Group g3 = groupRepository.save(Group.builder().groupName("Zenith Consumer Tech").description("Electronics, consumer appliances, and smart devices").status(Group.Status.ACTIVE).build());

            Chain c1 = chainRepository.save(Chain.builder().chainName("Hub Express").group(g1).description("Convenience grocery stores").status(Chain.Status.ACTIVE).build());
            Chain c2 = chainRepository.save(Chain.builder().chainName("Royal Suites & Hotels").group(g2).description("Five-star boutique hotels").status(Chain.Status.ACTIVE).build());
            Chain c3 = chainRepository.save(Chain.builder().chainName("Zenith SmartStores").group(g3).description("Consumer electronics stores").status(Chain.Status.ACTIVE).build());

            Brand b1 = brandRepository.save(Brand.builder().brandName("Hub Fresh Organics").chain(c1).description("Organic produce").status(Brand.Status.ACTIVE).build());
            Brand b2 = brandRepository.save(Brand.builder().brandName("Royal Grand Residence").chain(c2).description("Presidential suites").status(Brand.Status.ACTIVE).build());
            Brand b3 = brandRepository.save(Brand.builder().brandName("Zenith Pulse Audio").chain(c3).description("Hi-Fi sound systems").status(Brand.Status.ACTIVE).build());

            Subzone s1 = subzoneRepository.save(Subzone.builder().subzoneName("North Mumbai Metro").region("West").description("Bandra to Borivali").status(Subzone.Status.ACTIVE).build());
            Subzone s2 = subzoneRepository.save(Subzone.builder().subzoneName("Bengaluru Tech Corridor").region("South").description("Whitefield and Bellandur").status(Subzone.Status.ACTIVE).build());

            clientRepository.save(Client.builder()
                    .clientName("Acme Retail Ventures Ltd")
                    .contactPerson("Rajesh Sharma")
                    .email("procurement@acmeretail.com")
                    .phone("+91 98201 23456")
                    .address("Tower 3, Level 7, BKC Business Park")
                    .city("Mumbai")
                    .state("Maharashtra")
                    .gstin("27AABCU9603R1ZM")
                    .group(g1)
                    .chain(c1)
                    .brand(b1)
                    .subzone(s1)
                    .status(Client.Status.ACTIVE)
                    .build());

            clientRepository.save(Client.builder()
                    .clientName("Grand Metropolitan Hotels Pvt Ltd")
                    .contactPerson("Vikramaditya Rao")
                    .email("finance@grandmetro.in")
                    .phone("+91 98112 34567")
                    .address("42, Marine Lines, Churchgate")
                    .city("Mumbai")
                    .state("Maharashtra")
                    .gstin("27AABCG1234F1Z9")
                    .group(g2)
                    .chain(c2)
                    .brand(b2)
                    .subzone(s1)
                    .status(Client.Status.ACTIVE)
                    .build());
            logger.info("Sample business entities initialized.");
        }
    }

    private void initEstimatesAndInvoices() {
        if (estimateRepository.count() == 0 && clientRepository.count() > 0) {
            Client client = clientRepository.findAll().get(0);
            User salesperson = userRepository.findByEmail("john.sales@codeb.com").orElse(userRepository.findAll().get(0));

            Estimate est = Estimate.builder()
                    .estimateNumber("CB-EST-2026-001")
                    .client(client)
                    .chain(client.getChain())
                    .estimateDate(LocalDate.now().minusDays(10))
                    .validUntil(LocalDate.now().plusDays(20))
                    .salesperson(salesperson)
                    .status(Estimate.EstimateStatus.APPROVED)
                    .subtotal(new BigDecimal("150000.00"))
                    .discount(new BigDecimal("10000.00"))
                    .taxableAmount(new BigDecimal("140000.00"))
                    .gstRate(new BigDecimal("18.00"))
                    .gst(new BigDecimal("25200.00"))
                    .grandTotal(new BigDecimal("165200.00"))
                    .notes("POS Terminal upgrade project")
                    .build();

            EstimateItem item1 = EstimateItem.builder()
                    .estimate(est)
                    .description("Omni-directional 2D Barcode Scanners")
                    .quantity(10)
                    .unitPrice(new BigDecimal("8000.00"))
                    .discount(new BigDecimal("5000.00"))
                    .tax(new BigDecimal("13500.00"))
                    .total(new BigDecimal("88500.00"))
                    .build();

            EstimateItem item2 = EstimateItem.builder()
                    .estimate(est)
                    .description("Code-B POS Touch Terminals 15-inch")
                    .quantity(5)
                    .unitPrice(new BigDecimal("14000.00"))
                    .discount(new BigDecimal("5000.00"))
                    .tax(new BigDecimal("11700.00"))
                    .total(new BigDecimal("76700.00"))
                    .build();

            est.getItems().add(item1);
            est.getItems().add(item2);
            estimateRepository.save(est);

            Invoice inv = Invoice.builder()
                    .invoiceNumber("CB-INV-2026-001")
                    .client(client)
                    .chain(client.getChain())
                    .estimate(est)
                    .invoiceDate(LocalDate.now().minusDays(5))
                    .dueDate(LocalDate.now().plusDays(25))
                    .salesperson(salesperson)
                    .status(Invoice.InvoiceStatus.PARTIALLY_PAID)
                    .subtotal(new BigDecimal("150000.00"))
                    .discount(new BigDecimal("10000.00"))
                    .taxableAmount(new BigDecimal("140000.00"))
                    .gstRate(new BigDecimal("18.00"))
                    .gst(new BigDecimal("25200.00"))
                    .totalAmount(new BigDecimal("165200.00"))
                    .amountPaid(new BigDecimal("80000.00"))
                    .balanceDue(new BigDecimal("85200.00"))
                    .notes("50% advance payment received via RTGS")
                    .build();

            InvoiceItem invItem1 = InvoiceItem.builder()
                    .invoice(inv)
                    .description("Omni-directional 2D Barcode Scanners")
                    .quantity(10)
                    .unitPrice(new BigDecimal("8000.00"))
                    .discount(new BigDecimal("5000.00"))
                    .gst(new BigDecimal("13500.00"))
                    .total(new BigDecimal("88500.00"))
                    .build();

            InvoiceItem invItem2 = InvoiceItem.builder()
                    .invoice(inv)
                    .description("Code-B POS Touch Terminals 15-inch")
                    .quantity(5)
                    .unitPrice(new BigDecimal("14000.00"))
                    .discount(new BigDecimal("5000.00"))
                    .gst(new BigDecimal("11700.00"))
                    .total(new BigDecimal("76700.00"))
                    .build();

            inv.getItems().add(invItem1);
            inv.getItems().add(invItem2);
            Invoice savedInv = invoiceRepository.save(inv);

            Payment payment = Payment.builder()
                    .invoice(savedInv)
                    .client(client)
                    .paymentDate(LocalDate.now().minusDays(3))
                    .paymentMethod("Bank Transfer")
                    .paymentReference("RTGS-HDFC-99128371")
                    .amount(new BigDecimal("80000.00"))
                    .status(Payment.PaymentStatus.SUCCESS)
                    .notes("Phase 1 advance payment")
                    .recordedBy(salesperson)
                    .build();

            paymentRepository.save(payment);
            logger.info("Sample estimates, invoices, and payments initialized.");
        }
    }
}
