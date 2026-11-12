# Developer Notes

This is a static HTML, CSS, and JavaScript website. The deployable site is the
`public_html/` directory; it has no application build step or package manifest.
Make changes in the source files there, and preview the site over HTTP rather
than opening HTML files directly.

## Project layout

- Top-level public pages, such as `index.html`, `products.html`, and the
  solution pages, live in `public_html/`.
- Individual product pages live under `public_html/products/`, grouped into
  `activate/`, `modernize/`, and `protect/`. Most are nested `index.html`
  files; their relative asset paths depend on their directory depth.
- Shared site assets live in `public_html/assets/` (including CSS, images, and
  JavaScript). The separate `public_html/assets2/` tree is also used by the
  product explorer page and contains its own vendor assets.
- `public_html/documentation/` contains developer documentation. The website
  itself is served from `public_html/`.
- `selenium_tests/` contains browser tests for the static site.

## Preview locally

From the repository root, start Python's static server:

```powershell
py -m http.server 8000 --directory public_html
```

Open `http://localhost:8000` in a browser. Stop the server with Ctrl+C when
finished. Serving the directory over HTTP helps preserve the relative URL
behavior used by nested product pages.

## Before editing

- Check how a page loads its CSS and JavaScript before changing shared behavior.
  The top-level site pages and the product explorer do not all use the same
  frontend assets.
- Shared scripts under `assets/js/` may be loaded by multiple pages. A change
  to one can affect pages beyond the one currently being edited.
- Keep links and asset paths correct for the page's directory depth. A path
  that works from a top-level page may break from a nested product page.
- Product catalog assets are not necessarily pages. Add only real, intended
  public page URLs to the sitemap; do not list images, backup files, or
  non-public files as pages.
- When adding or renaming a public page, check its navigation links, canonical
  URL, and `sitemap.xml`. Review `robots.txt` if crawler access or the sitemap
  location changes.
- Preserve existing integration settings and verification files unless the
  change specifically requires updating them. Do not put credentials or
  private information in client-side HTML or JavaScript.
- Avoid editing minified or third-party vendor files for ordinary site changes
  when the site's own source files can be changed instead.

## Browser tests

The Selenium suite needs Python 3.10+, Google Chrome, and Selenium 4.6+. Install
its dependency from the repository root if needed:

```powershell
py -m pip install -r selenium_tests\requirements.txt
```

With the local server running, open a second terminal at the repository root
and run:

```powershell
python -m unittest discover -s selenium_tests -v
```

The suite checks page rendering, selected navigation, carousel and contact
form interactions, client-side validation, and browser errors. It blocks
FormSubmit requests and uses an AJAX stub; it does not verify real email
delivery. For details and safe real-delivery testing guidance, see
[`selenium_tests/README.md`](../../selenium_tests/README.md).

## Contact form: change recipient emails

The contact form routes inquiries to different recipients based on the service
selected by the visitor:

- **Technical Support** uses the technical-support FormSubmit endpoint.
- **Sales & Product Inquiries** uses the sales FormSubmit endpoint.

To change the recipients:

1. Open `public_html/assets/js/contact-form.js`.
2. Find the `setRecipient()` function.
3. Replace the destination in each FormSubmit URL, keeping the condition and
   the order of the destinations:

   ```javascript
   function setRecipient() {
     var recipient = form.elements.service.value === 'Technical Support'
       ? 'https://formsubmit.co/TECHNICAL_SUPPORT_EMAIL@example.com'
       : 'https://formsubmit.co/SALES_EMAIL@example.com';
     form.action = recipient;
     return recipient;
   }
   ```

   Replace the placeholders with the intended email addresses. The first is
   for Technical Support; the second is for Sales & Product Inquiries. The
   current project URLs use FormSubmit endpoint IDs, so the existing recipient
   email addresses cannot be determined from the project files.

4. Save and deploy the updated script.
5. Test both service selections. FormSubmit may require the new recipient to
   verify or activate the form before messages are delivered.

The attachment submission path uses the same recipient selected by
`setRecipient()`, so it does not have a separate recipient setting.

## Other external integrations

- FormSubmit processes contact form submissions. The automated test suite
  deliberately blocks requests to it.
- The homepage loads the ShowTrust testimonials widget externally. Its
  configuration and loader are in `public_html/index.html`; preserve the
  widget mount element and configured project ID when changing that section.
