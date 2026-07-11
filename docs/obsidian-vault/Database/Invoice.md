---
tags: [database]
---
# Invoice

Domain: [[BILLING & SUBSCRIPTION (SUMOPOD)]]

## Field

- `id`: String
- `subscriptionId`: String
- `invoiceNumber`: String
- `sumopodPaymentId`: String?
- `amount`: Int
- `tax`: Int
- `total`: Int
- `currency`: String
- `status`: InvoiceStatus
- `dueDate`: DateTime
- `paidDate`: DateTime?
- `description`: String
- `fromDate`: DateTime
- `toDate`: DateTime
- `items`: Json?
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relasi Database

- [[PaymentHistory]] (`paymentHistory`, 1-N)
- [[Subscription]] (`invoices`, 1-N)

## Dipakai oleh Fitur

- [[billing-service]]
