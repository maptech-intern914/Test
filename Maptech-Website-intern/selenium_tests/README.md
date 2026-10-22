# Selenium browser tests

Python Selenium tests for the static Maptech website. The tests run against a
local HTTP server only. Form validation and the client-side submission handler
are tested without contacting FormSubmit or sending email.

## Prerequisites

- Python 3.10 or newer
- Google Chrome
- Selenium 4.6 or newer (Selenium Manager uses this to resolve ChromeDriver)

Selenium Manager downloads or selects a compatible ChromeDriver automatically
when needed. Its first use may require internet access. No separate
ChromeDriver installation is required.

## Install

From the repository root, create and activate a virtual environment, then
install the test dependency:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r selenium_tests\requirements.txt
```

On this machine, Python, Chrome, and Selenium are already available, so no
dependency installation is needed to run the current suite.

## Run against the local site

In one PowerShell window, start the website from the repository root:

```powershell
py -m http.server 8000 --directory public_html
```

In a second window, from the repository root:

```powershell
python -m unittest discover -s selenium_tests -v
```

The tests use `http://localhost:8000` by default. To test another locally
hosted instance, set `MAPTECH_BASE_URL`, for example:

```powershell
$env:MAPTECH_BASE_URL = "http://localhost:8080"
python -m unittest discover -s selenium_tests -v
```

The runner prints each test result and Python's unittest failure details.

## Coverage and safety

- Loads each HTML page and verifies that it renders a title and body content.
- Follows homepage-to-cybersecurity and cybersecurity-to-product-category
  navigation.
- Follows the homepage Contact navigation to the inline contact form section.
- Exercises the testimonial carousel and contact form's add/remove file-link
  controls.
- Checks required-field and email-format validation using fictional test data.
- Selects a generated local fixture to verify attachment selection and list
  rendering.
- Runs the valid-form client-side submit handler against an in-browser AJAX
  stub, then checks and closes the resulting failure dialog. The stub records
  only the target URL, method, and field names; it does not send a request.
- Fails on severe browser JavaScript errors. Failed resource-load messages are
  excluded because remote fonts, maps, or other third-party resources may be
  unavailable during local testing.

The contact form is an inline section, not a modal. Its result dialog appears
after a response from the submission handler. Chrome is configured to block
requests to `formsubmit.co` as an additional safeguard, and the submission
test replaces jQuery AJAX with a local stub before submitting fictional test
data. Thus, the suite exercises the page's valid-submit code path but does not
send a request to FormSubmit. When an attachment is selected, the production
code uses a direct multipart form POST; the tests select a local fixture but
do not submit that path.

## Real email and attachment end-to-end testing

Real delivery is intentionally outside this automated suite. Only with
approval, use one manually initiated submission with fictional test details
and a designated, authorized test mailbox. Do not use customer details or
repeat submissions. Check the recipient inbox and spam folder for the message,
then open it and verify the attachment is present and readable. For attachment
receipt, use a small harmless test file and confirm its name and contents in
the received message. Follow any FormSubmit activation/setup requirements
before interpreting a missing email as a website defect.

A browser dialog or a successful HTTP/AJAX response alone does not prove
delivery to the mailbox or confirm attachment receipt. This suite neither
bypasses CAPTCHA/security controls nor tests live-site behavior, FormSubmit
availability, server-side handling, email delivery, or received attachments.
