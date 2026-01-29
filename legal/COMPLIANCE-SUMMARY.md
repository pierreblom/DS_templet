# South African E-Commerce Compliance Summary

Quick reference guide for ShopBeha's legal compliance requirements.

## 📋 Three Core Laws

### 1. POPIA (Protection of Personal Information Act 4 of 2013)

**Purpose:** Protects personal information of customers

**Key Requirements:**
- ✅ Privacy Policy published
- ✅ Obtain consent before processing personal data
- ✅ Only collect necessary information
- ✅ Implement security measures
- ✅ Provide data subject rights (access, correction, deletion)
- ✅ Appoint Information Officer
- ✅ Register with Information Regulator
- ✅ Maintain audit logs (5+ years)

**Maximum Penalty:** R10 million fine or 10 years imprisonment

**Covered by:**
- Privacy Policy
- Cookie Policy
- Consent mechanisms on website

---

### 2. Consumer Protection Act 68 of 2008 (CPA)

**Purpose:** Protects consumer rights in transactions

**Key Requirements:**
- ✅ 7-day cooling-off period for online purchases
- ✅ Clear pricing (VAT inclusive)
- ✅ Plain language terms and conditions
- ✅ Right to return defective products
- ✅ Fair contract terms
- ✅ Complaint handling procedures
- ✅ Contact details accessible

**Penalties:** Fines up to 10% of annual turnover or R1 million

**Covered by:**
- Terms and Conditions
- Return and Refund Policy
- Clear pricing on website

---

### 3. ECTA (Electronic Communications and Transactions Act 25 of 2002)

**Purpose:** Regulates electronic transactions and online business

**Key Requirements:**
- ✅ Disclose business details (name, registration, address, contact)
- ✅ Clear order process
- ✅ Electronic signatures valid
- ✅ Cooling-off rights
- ✅ Security measures disclosed
- ✅ Dispute resolution procedures

**Penalties:** Fines or imprisonment for non-compliance

**Covered by:**
- ECTA Disclosure document
- Terms and Conditions
- Website contact information

---

## 🔑 Critical Compliance Points

### Must-Have Information

**On Every Page Footer:**
```
- Privacy Policy link
- Terms & Conditions link
- Cookie Policy link
- Contact email
- Company registration number
- Physical address
```

**At Checkout:**
```
- Terms acceptance checkbox (required)
- Privacy Policy link
- Return policy notice
- 7-day cooling-off notice
- Total price breakdown (inc. VAT)
- Marketing consent (optional)
```

**At Registration:**
```
- Privacy consent (required)
- Privacy Policy link
- Marketing opt-in (optional)
- Clear explanation of data use
```

**On First Visit:**
```
- Cookie consent banner
- Accept/Reject/Customise options
- Link to Cookie Policy
```

---

## 📊 Data Subject Rights (POPIA Section 23-27)

Customers can request:

| Right | What It Means | Response Time |
|-------|--------------|---------------|
| **Access** | Copy of their personal data | 30 days |
| **Correction** | Fix incorrect information | 30 days |
| **Deletion** | Remove their data (with exceptions) | 30 days |
| **Objection** | Stop certain data processing | Immediately |
| **Restriction** | Limit how data is used | Immediately |
| **Portability** | Data in machine-readable format | 30 days |

**How to Handle Requests:**
1. Verify identity
2. Log the request
3. Respond within 30 days
4. Document the action taken
5. Inform customer of outcome

**Free of Charge:** First request is free; may charge reasonable fee for repeated requests.

---

## 🔐 Security Requirements (POPIA Section 19)

**Required Security Measures:**

✅ **Technical:**
- TLS 1.3 encryption (minimum TLS 1.2)
- Encrypted databases
- Secure password storage (bcrypt)
- Regular security updates
- Firewall protection
- Access controls

✅ **Organisational:**
- Staff training on data protection
- Access control policies
- Incident response plan
- Regular security audits
- Data breach procedures

✅ **Monitoring:**
- Audit logs of all data access
- Failed login monitoring
- Suspicious activity alerts
- Regular vulnerability scans

---

## 💰 Pricing and Payment Compliance

**Required:**
- ✅ All prices in ZAR
- ✅ VAT included in displayed prices (or clearly stated separately)
- ✅ Total price shown before order confirmation
- ✅ No hidden fees
- ✅ Delivery costs calculated before payment
- ✅ Secure payment processor (PCI-DSS compliant)

**Example Price Display:**
```
Product: The Snap & Go Bra
Price: R399 (incl. VAT)

At Checkout:
Subtotal: R399
Delivery: R65
Total: R464 (VAT included)
```

---

## 📦 Return Rights (CPA Section 16, 20)

**7-Day Cooling-Off Period:**
- Applies to ALL online purchases
- Starts from date of receipt
- Customer doesn't need to provide reason
- Customer pays return shipping
- Full refund (excluding delivery costs)
- Product must be unused with tags intact

**Exception for Hygiene Products:**
- Cannot return if hygiene seal is broken
- Unless product is defective

**Defective Products:**
- Full refund including all costs
- Or replacement at no cost
- Company pays return shipping
- No time limit (reasonable period)

---

## 📧 Email Marketing Compliance (POPIA)

**Before Sending Marketing Emails:**
- ✅ Must have explicit opt-in consent
- ✅ Clear explanation of what they're subscribing to
- ✅ Easy opt-out mechanism in every email
- ✅ Process opt-outs within 7 business days
- ✅ Never purchase email lists

**Every Marketing Email Must Include:**
```
- Your physical address
- Unsubscribe link (prominent)
- Reason they're receiving the email
- Your contact information
- Company registration details
```

**Transactional Emails (Always Allowed):**
- Order confirmations
- Shipping notifications
- Password resets
- Account notifications

---

## 🍪 Cookie Compliance

**Cookie Categories:**

| Category | Required? | Examples |
|----------|-----------|----------|
| Essential | Yes | Shopping cart, login, security |
| Performance | No | Google Analytics |
| Functional | No | Language preference, recently viewed |
| Marketing | No | Facebook Pixel, Google Ads |

**Consent Requirements:**
- ✅ Banner on first visit
- ✅ Clear explanation of cookie use
- ✅ Accept/Reject options
- ✅ Link to Cookie Policy
- ✅ Don't load non-essential cookies until consent
- ✅ Allow users to change preferences

**Cookie Lifetime:**
- Essential: Session to 7 days
- Others: Maximum 1-2 years

---

## 🔔 Notification Requirements

**Must Notify Customers About:**

**Data Breaches (Within 72 hours):**
- Notify affected customers
- Notify Information Regulator
- Explain what happened
- What data was affected
- What you're doing about it
- How they can protect themselves

**Policy Changes:**
- Update "Last Updated" date
- Email notification for material changes
- 30 days notice before changes take effect (if possible)

**Order Status:**
- Order confirmation (immediate)
- Payment confirmation (immediate)
- Shipping confirmation (when dispatched)
- Delivery notification (when delivered)

---

## 📝 Required Records (POPIA Section 51)

**Must Keep Records Of:**

| Record Type | Retention Period |
|-------------|------------------|
| Personal data processing operations | While processing + 1 year |
| Audit logs | 5 years minimum |
| Customer orders | 7 years (tax requirement) |
| Consent records | While processing + 3 years |
| Privacy requests | 5 years |
| Data breaches | 5 years |
| Staff training | 5 years |

**Record Format:**
- Digital or paper
- Accessible for audits
- Secure storage
- Regular backups

---

## ⚠️ Common Compliance Mistakes to Avoid

**DON'T:**
- ❌ Hide terms in small print
- ❌ Use pre-ticked consent boxes
- ❌ Send marketing without consent
- ❌ Make it difficult to unsubscribe
- ❌ Collect unnecessary personal data
- ❌ Share data without consent
- ❌ Ignore data subject requests
- ❌ Delay breach notifications
- ❌ Use insecure payment methods
- ❌ Store passwords in plain text
- ❌ Load tracking before consent

**DO:**
- ✅ Be transparent about data use
- ✅ Make policies easily accessible
- ✅ Respond promptly to requests
- ✅ Keep records of all consents
- ✅ Train staff on compliance
- ✅ Review policies regularly
- ✅ Test consent mechanisms
- ✅ Monitor for breaches
- ✅ Update security regularly
- ✅ Document everything

---

## 🚨 Breach Response Plan

**If a Data Breach Occurs:**

**Immediate (Hour 1):**
1. Contain the breach
2. Assess the damage
3. Document everything
4. Notify management

**Within 24 Hours:**
1. Investigate fully
2. Determine affected data
3. Draft breach report
4. Prepare customer notification

**Within 72 Hours:**
1. Notify Information Regulator
2. Notify affected customers
3. Publish breach notice (if required)
4. Implement remediation

**Follow-Up:**
1. Conduct post-incident review
2. Update security measures
3. Retrain staff if needed
4. Document lessons learned

**Information Regulator Contact:**
- Email: inforeg@justice.gov.za
- Phone: 010 023 5200
- Online: https://www.justice.gov.za/inforeg/

---

## 📞 Key Contacts

### Internal

**Information Officer:** [TO BE COMPLETED]
- Email: privacy@shopbeha.com
- Responsible for: POPIA compliance, data subject requests

**Compliance Officer:** [TO BE COMPLETED]
- Email: legal@shopbeha.com
- Responsible for: General compliance, policy updates

**Customer Service:** support@shopbeha.com
- Responsible for: General enquiries, complaints

### External

**Information Regulator (POPIA):**
- Website: https://www.justice.gov.za/inforeg/
- Email: inforeg@justice.gov.za
- Phone: 010 023 5200

**Consumer Commission (CPA):**
- Website: www.theconsumercommission.org.za
- Email: complaints@theconsumercommission.org.za
- Phone: 012 428 7000

**National Consumer Tribunal:**
- Website: www.thenct.org.za
- Email: info@thenct.org.za
- Phone: 012 428 7000

---

## ✅ Monthly Compliance Checklist

**Operations:**
- [ ] Review customer complaints and resolutions
- [ ] Check for outstanding data subject requests
- [ ] Review security logs for anomalies
- [ ] Test backup and recovery procedures
- [ ] Update staff on any policy changes

**Technical:**
- [ ] Review audit logs
- [ ] Check for security updates
- [ ] Test unsubscribe functionality
- [ ] Verify SSL certificate validity
- [ ] Review access controls

**Legal:**
- [ ] Review policy documents for accuracy
- [ ] Check for new legislation
- [ ] Update contact information if changed
- [ ] Review consent rates
- [ ] Document any incidents

---

## 📚 Quick Reference Links

**Your Policies:**
- [Privacy Policy](./privacy-policy.md)
- [Terms and Conditions](./terms-and-conditions.md)
- [Return and Refund Policy](./return-refund-policy.md)
- [Shipping Policy](./shipping-policy.md)
- [Cookie Policy](./cookie-policy.md)
- [ECTA Disclosure](./ecta-disclosure.md)

**Implementation:**
- [Implementation Guide](./IMPLEMENTATION-GUIDE.md)
- [README](./README.md)

**External Resources:**
- POPIA Full Text: https://popia.co.za/
- CPA Full Text: http://www.acts.co.za/consumer-protection-act-2008/
- ECTA Full Text: https://www.gov.za/documents/electronic-communications-and-transactions-act

---

## 🎯 Compliance Score

Use this to self-assess your compliance:

### POPIA Compliance (35 points total)
- [ ] Privacy Policy published (5 pts)
- [ ] Consent mechanisms implemented (5 pts)
- [ ] Information Officer appointed (5 pts)
- [ ] Registered with Information Regulator (5 pts)
- [ ] Security measures in place (5 pts)
- [ ] Audit logging functional (5 pts)
- [ ] Data subject rights procedures (5 pts)

### CPA Compliance (25 points total)
- [ ] Terms & Conditions published (5 pts)
- [ ] Return policy (7 days) implemented (5 pts)
- [ ] Clear pricing (VAT inclusive) (5 pts)
- [ ] Complaint procedures documented (5 pts)
- [ ] Contact details accessible (5 pts)

### ECTA Compliance (20 points total)
- [ ] Business details disclosed (5 pts)
- [ ] ECTA Disclosure published (5 pts)
- [ ] Clear transaction process (5 pts)
- [ ] Security measures disclosed (5 pts)

### Website Implementation (20 points total)
- [ ] Policy pages live (5 pts)
- [ ] Cookie banner functional (5 pts)
- [ ] Email templates compliant (5 pts)
- [ ] Checkout consent flows (5 pts)

**Total Score: _____ / 100**

- **90-100:** Excellent compliance
- **70-89:** Good, minor improvements needed
- **50-69:** Adequate, several areas need attention
- **Below 50:** Urgent action required

---

## 💡 Pro Tips

1. **Document Everything:** When in doubt, create a record
2. **Be Transparent:** Honesty builds trust and ensures compliance
3. **Simplify:** Use plain language, avoid legal jargon
4. **Test Regularly:** Check all consent and opt-out mechanisms monthly
5. **Train Staff:** Everyone should understand basic compliance
6. **Stay Updated:** Laws change; review policies annually
7. **Seek Legal Advice:** For complex situations, consult an attorney
8. **Customer First:** If it's good for customers, it's usually compliant

---

**Questions or Concerns?**

Internal: legal@shopbeha.com  
External: Consult a qualified South African attorney

**Last Updated:** 26 January 2026
