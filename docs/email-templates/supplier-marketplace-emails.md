# Supplier Marketplace Email Templates

This document records every supplier marketplace email introduced by the supplier execution plan.

## Supabase Auth Templates

These belong in Supabase Auth email templates because they are tied to account/invite authentication.

| Template | Trigger | Recipient | Subject | Variables | Rendered HTML |
| --- | --- | --- | --- | --- | --- |
| Supplier invite | Admin creates supplier and invites owner | Supplier owner email | You are invited to join Bewama as a supplier | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}` | `supabase/email-templates/supplier-invite.html` |
| Supplier staff invite | Supplier owner/manager invites staff | Staff email | You are invited to join a supplier team on Bewama | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}` | `supabase/email-templates/supplier-staff-invite.html` |

Invite copy must say the link expires in 7 days.

## App Operational Templates

These are sent by the app through `SupplierNotificationEmail` or existing quote/order notification services. They should not be configured as Supabase Auth templates.

| Template | Trigger | Recipient | Subject | Variables | Rendered HTML |
| --- | --- | --- | --- | --- | --- |
| Supplier application received | Logged-in user submits supplier application | Applicant | Supplier application received | `companyName`, `contactName`, `applicationId` | `src/emails/rendered/supplier/application-received.html` |
| Supplier application approved | Admin approves application | Applicant | Supplier application approved | `companyName`, `portalUrl` | `src/emails/rendered/supplier/application-approved.html` |
| Supplier application rejected | Admin rejects application | Applicant | Supplier application update | `companyName`, `adminNotes`, `supportEmail` | `src/emails/rendered/supplier/application-rejected.html` |
| Supplier setup reminder | Supplier has incomplete setup checklist | Supplier owner/manager | Complete your supplier setup | `companyName`, `portalUrl`, `missingSteps` | `src/emails/rendered/supplier/setup-reminder.html` |
| Supplier staff joined | Staff accepts invite | Supplier owner/manager | Staff member joined your supplier team | `companyName`, `staffEmail`, `memberRole` | `src/emails/rendered/supplier/staff-joined.html` |
| New supplier fulfilment | Paid order creates supplier fulfilment | Supplier notification recipients | New Bewama fulfilment | `orderId`, `fulfilmentId`, `items`, `deliveryRegion`, `portalUrl` | `src/emails/rendered/supplier/new-fulfilment.html` |
| Supplier rejected fulfilment alert | Supplier rejects a fulfilment | Bewama admin | Supplier fulfilment rejected | `orderId`, `supplierName`, `reason` | `src/emails/rendered/supplier/rejected-fulfilment-admin-alert.html` |
| Buyer multi-fulfilment order confirmation | Buyer pays for multi-supplier eligible groups | Buyer | Order confirmed | `orderId`, `fulfilments`, `supportRequests` | `src/emails/rendered/supplier/buyer-multi-fulfilment-confirmation.html` |
| Buyer support request confirmation | Unsupported checkout items become quote/support | Buyer | Delivery support request received | `quoteId`, `items`, `deliveryRegion` | `src/emails/rendered/supplier/buyer-support-request-confirmation.html` |
| Supplier product paused by admin | Admin pauses supplier product | Supplier owner/manager | Product paused by Bewama admin | `productName`, `reason`, `portalUrl` | `src/emails/rendered/supplier/product-paused.html` |
| Supplier warning notice | Admin records warning | Supplier owner/manager | Supplier performance warning | `companyName`, `severity`, `notes` | `src/emails/rendered/supplier/warning-notice.html` |
| Supplier auto-pause notice | Auto-pause threshold pauses supplier/product later | Supplier owner/manager | Supplier activity auto-paused | `companyName`, `reason`, `nextSteps` | `src/emails/rendered/supplier/auto-pause-notice.html` |
| Supplier suspended notice | Admin suspends supplier | Supplier owner/manager | Supplier account suspended | `companyName`, `reason`, `supportEmail` | `src/emails/rendered/supplier/suspended-notice.html` |
| Supplier reactivated notice | Admin reactivates supplier | Supplier owner/manager | Supplier account reactivated | `companyName`, `portalUrl` | `src/emails/rendered/supplier/reactivated-notice.html` |

## Implementation Notes

- All supplier marketplace templates include the Bewama logo from `https://bewama.com/logo.png`.
- Supabase Auth templates are for account authentication only.
- App operational emails should log attempts to `supplier_notification_logs` when supplier-related.
- Supplier fulfilment emails must include only that supplier's fulfilment items.
- Buyer emails can show fulfilment sections, but supplier names remain hidden unless a later product decision changes buyer visibility.
