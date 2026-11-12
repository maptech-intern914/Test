# Changing Contact Form Recipient Emails

The contact form routes inquiries to different recipients based on the service selected by the visitor:

- **Technical Support** uses the technical-support FormSubmit endpoint.
- **Sales & Product Inquiries** uses the sales FormSubmit endpoint.

## Change the recipients

1. Open `public_html/assets/js/contact-form.js`.
2. Find the `setRecipient()` function.
3. Replace the email address in each FormSubmit URL with the new recipient address. Keep the existing condition and URL format:

   ```javascript
   function setRecipient() {
     var recipient = form.elements.service.value === 'Technical Support'
       ? 'https://formsubmit.co/TECHNICAL_SUPPORT_EMAIL@example.com'
       : 'https://formsubmit.co/SALES_EMAIL@example.com';
     form.action = recipient;
     return recipient;
   }
   ```

   Replace `TECHNICAL_SUPPORT_EMAIL@example.com` and `SALES_EMAIL@example.com` with the intended addresses. The first URL is for Technical Support; the second is for Sales & Product Inquiries.

4. Save and deploy the updated file.
5. Submit a test inquiry for each service and confirm it reaches the intended inbox. If FormSubmit asks the new recipient to activate or verify the form, follow its instructions.

The existing URLs contain FormSubmit endpoint IDs rather than readable email addresses, so the current recipient addresses cannot be determined from the project files. The attachment submission path uses the same recipient selected by `setRecipient()`, so no separate recipient setting is needed for attachments.
