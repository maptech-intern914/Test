# FormSubmit and ShowTrust Integrations

This document describes the contact form and testimonial integrations used by the Maptech static website.

## FormSubmit Contact Form

### Location

- Contact form markup is in the contact section of public pages under `public_html/`. The homepage form is in `public_html/index.html`.
- Shared form behavior is implemented in `public_html/assets/js/contact-form.js` and loaded on pages that contain the contact form.
- Contact form styles are in `public_html/assets/css/maptech-contact.css`.

### Visitor Usage

1. Open a page's Contact Us section and enter the required contact and inquiry details.
2. Select **Sales & Product Inquiries** or **Technical Support**. The selected service determines which FormSubmit endpoint receives the inquiry.
3. Optionally attach PDF, DOCX, JPG/JPEG, PNG, or WEBP files, or add HTTP/HTTPS file-sharing links. The combined attachment size limit is 10 MB.
4. Submit the form. A status message and result dialog report the submission outcome.

### How It Is Implemented

- Each page's form uses the `maptech-contact-form` ID and has a FormSubmit HTTPS endpoint as its action. The JavaScript switches between sales and technical-support endpoint IDs when the service selection changes. The endpoint IDs are configured in `setRecipient()` in `assets/js/contact-form.js`; they identify FormSubmit destinations and are not email passwords or API secrets.
- The form includes hidden fields for the email subject, table template, CAPTCHA, reply-to address, return URL, and file links. On submit, the handler sets the subject using the service and company, and uses the visitor's email as the reply-to address.
- FormSubmit handles ordinary submissions directly. For attachments selected through the custom drop area, the handler sends a `FormData` payload to FormSubmit's AJAX endpoint. It checks allowed file extensions, prevents duplicate selections, and enforces the 10 MB combined limit.
- Added sharing links are validated as HTTP/HTTPS URLs and included in the `file_links` form field. Links are not uploaded as attachments.
- After a successful standard submission, FormSubmit returns the visitor to the same page URL where the form was submitted, preserving its query string and fragment. The handler temporarily adds and then removes the `contact=success` query parameter to display the success dialog. AJAX submissions display the result without a page redirect.
- The `_captcha` field is enabled. FormSubmit may require the destination email to be verified/activated by its owner before delivery works; check the relevant inbox and FormSubmit's current setup instructions if a destination is newly configured.

### Changing Form Routing

Update the two endpoint IDs in `setRecipient()` in `assets/js/contact-form.js` to change the FormSubmit destinations. Keep the service labels and values in each page's form aligned with the checks in that function. Test both service selections and submissions with and without attachments after changing the routing.

## ShowTrust Testimonials

### Location

- The widget mount point, `<div id="showtrustto-widget"></div>`, is in the Testimonials section of `public_html/index.html`.
- The ShowTrust project configuration and asynchronous script loader are near the end of `public_html/index.html`, after the site's local JavaScript includes.

### Visitor Usage

The ShowTrust widget displays approved testimonials in the homepage Testimonials section. The **Leave a Testimonial** link opens Maptech's ShowTrust testimonial page in a new tab.

### How It Is Implemented

The homepage sets `window.SHOWTRUSTTO_WIDGET_CONFIG` with the ShowTrust project ID, then creates an async script element for `https://app.showtrust.to/showtrustto-widget.js`. The external script reads the configuration and renders into the element with ID `showtrustto-widget`. The section and submission link are part of the static page; testimonial content and widget behavior are provided by ShowTrust.

To move the widget, keep the mount element ID aligned with the element ID expected by the provider's integration. To connect a different ShowTrust project, update `projectId` in the homepage loader and confirm the external testimonial link points to the intended project. The current widget is configured on the homepage only.
