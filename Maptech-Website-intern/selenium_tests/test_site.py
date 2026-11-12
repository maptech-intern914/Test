import os
import tempfile
import unittest
from pathlib import Path
from urllib.parse import urljoin, urlparse

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


TIMEOUT_SECONDS = 10
HTML_PAGES = (
    "index.html",
    "products.html",
    "cybersecurity.html",
    "data-infrastructure.html",
    "it-peripherals.html",
    "computing-devices.html",
    "under-repair.html",
    "_itperipherals.html",
)


class MaptechWebsiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_url = os.environ.get(
            "MAPTECH_BASE_URL", "http://localhost:8000"
        ).rstrip("/")
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1440,1000")
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

        try:
            cls.driver = webdriver.Chrome(options=options)
        except WebDriverException as error:
            raise RuntimeError(
                "Could not start Chrome. Check that Chrome is installed and "
                "that Selenium Manager can access a compatible ChromeDriver."
            ) from error

        cls.driver.set_page_load_timeout(TIMEOUT_SECONDS)
        cls.wait = WebDriverWait(cls.driver, TIMEOUT_SECONDS)
        cls.browser_errors = []

        # Prevent accidental contact submissions from ever reaching the service.
        cls.driver.execute_cdp_cmd("Network.enable", {})
        cls.driver.execute_cdp_cmd(
            "Network.setBlockedURLs", {"urls": ["*formsubmit.co/*"]}
        )

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def tearDown(self):
        self.collect_browser_errors()

    def page_url(self, page):
        return urljoin(self.base_url + "/", page)

    def open_page(self, page):
        self.driver.get(self.page_url(page))
        self.wait.until(
            lambda driver: driver.execute_script("return document.readyState")
            == "complete"
        )
        self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    def collect_browser_errors(self):
        for entry in self.driver.get_log("browser"):
            if (
                entry.get("level") == "SEVERE"
                and "Failed to load resource" not in entry.get("message", "")
            ):
                self.browser_errors.append(entry.get("message", entry))

    def fill_required_contact_fields(self, email="selenium@example.invalid"):
        values = {
            "home-name": "Selenium Test",
            "home-company": "Example Test Company",
            "home-email": email,
            "home-phone": "09171234567",
            "home-message": "Automated local browser test; no response requested.",
        }
        for field_id, value in values.items():
            self.driver.find_element(By.ID, field_id).send_keys(value)

    def install_local_ajax_stub(self):
        self.driver.execute_script(
            """
            window.__maptechAjaxCalls = [];
            window.jQuery.ajax = function (options) {
                window.__maptechAjaxCalls.push({
                    url: options.url,
                    method: options.method,
                    fieldNames: Array.from(options.data.keys())
                });
                var chain = {
                    done: function () { return chain; },
                    fail: function (callback) {
                        callback();
                        return chain;
                    },
                    always: function (callback) {
                        callback();
                        return chain;
                    }
                };
                return chain;
            };
            """
        )

    def test_all_pages_load(self):
        for page in HTML_PAGES:
            with self.subTest(page=page):
                self.open_page(page)
                self.assertTrue(
                    self.driver.title.strip(),
                    f"{page} did not set a document title",
                )
                self.assertTrue(
                    self.driver.find_element(By.TAG_NAME, "body").text.strip(),
                    f"{page} rendered an empty body",
                )

    def test_navigation_reaches_expected_pages(self):
        self.open_page("index.html")
        cybersecurity_link = self.wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, 'a.text-button[href="cybersecurity.html"]')
            )
        )
        cybersecurity_link.click()
        self.wait.until(
            lambda driver: urlparse(driver.current_url).path.endswith(
                "/cybersecurity.html"
            )
        )

        product_link = self.wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    '.main-button a[href="products.html#product-category-cyber-security"]',
                )
            )
        )
        product_link.click()
        self.wait.until(
            lambda driver: urlparse(driver.current_url).fragment
            == "product-category-cyber-security"
        )
        self.wait.until(
            EC.presence_of_element_located(
                (By.ID, "product-category-cyber-security")
            )
        )

    def test_testimonial_carousel_controls(self):
        self.open_page("index.html")
        next_button = self.driver.find_element(
            By.CSS_SELECTOR, "[data-carousel-next]"
        )
        track = self.driver.find_element(
            By.CSS_SELECTOR, "[data-carousel] .maptech-carousel-track"
        )
        maximum_scroll = self.driver.execute_script(
            "return arguments[0].scrollWidth - arguments[0].clientWidth", track
        )

        if maximum_scroll <= 1:
            self.assertTrue(next_button.get_property("disabled"))
            return

        current_dot = self.driver.find_element(
            By.CSS_SELECTOR, '[data-carousel-dots] [aria-current="true"]'
        )
        current_position = self.driver.find_elements(
            By.CSS_SELECTOR, "[data-carousel-dots] button"
        ).index(current_dot)
        next_button.click()
        self.wait.until(
            lambda driver: driver.find_elements(
                By.CSS_SELECTOR, "[data-carousel-dots] button"
            ).index(
                driver.find_element(
                    By.CSS_SELECTOR,
                    '[data-carousel-dots] [aria-current="true"]',
                )
            )
            != current_position
        )

    def test_contact_link_controls_add_and_remove_a_link(self):
        self.open_page("index.html")
        link_input = self.driver.find_element(By.ID, "maptech-link-input")
        add_button = self.driver.find_element(By.ID, "home-add-link")

        link_input.send_keys("ftp://example.com/test-file")
        add_button.click()
        self.assertIn(
            "valid web link",
            self.driver.find_element(By.ID, "maptech-form-status").text,
        )

        link_input.clear()
        link_input.send_keys("https://example.com/selenium-test-file")
        add_button.click()
        link_item = self.wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, "#maptech-link-list li")
            )
        )
        self.assertIn("https://example.com/selenium-test-file", link_item.text)
        link_item.find_element(By.TAG_NAME, "button").click()
        self.wait.until(
            lambda driver: not driver.find_elements(
                By.CSS_SELECTOR, "#maptech-link-list li"
            )
        )

    def test_required_contact_fields_reject_an_empty_form(self):
        self.open_page("index.html")
        form = self.driver.find_element(By.ID, "maptech-contact-form")
        invalid_required_fields = self.driver.execute_script(
            "return Array.from(arguments[0].querySelectorAll(':required'))"
            ".filter(function (field) { return !field.checkValidity(); })"
            ".map(function (field) { return field.id; })",
            form,
        )
        self.assertEqual(
            set(invalid_required_fields),
            {"home-name", "home-company", "home-email", "home-phone", "home-message"},
        )

        original_url = self.driver.current_url
        self.driver.find_element(
            By.CSS_SELECTOR, "#maptech-contact-form [type='submit']"
        ).click()
        self.assertEqual(
            self.driver.current_url,
            original_url,
            "The empty contact form should not navigate or submit.",
        )

    def test_contact_navigation_opens_inline_form_section(self):
        self.open_page("index.html")
        self.driver.find_element(
            By.CSS_SELECTOR, '.nav a[href="#contact-us"]'
        ).click()
        self.wait.until(
            lambda driver: urlparse(driver.current_url).fragment == "contact-us"
        )
        form = self.wait.until(
            EC.visibility_of_element_located((By.ID, "maptech-contact-form"))
        )
        self.assertTrue(form.is_displayed())

    def test_invalid_email_is_rejected_before_submit_handler(self):
        self.open_page("index.html")
        self.fill_required_contact_fields(email="not-an-email")
        email = self.driver.find_element(By.ID, "home-email")
        self.assertFalse(email.get_property("validity")["valid"])
        self.assertTrue(email.get_property("validity")["typeMismatch"])
        self.install_local_ajax_stub()
        original_url = self.driver.current_url

        self.driver.find_element(
            By.CSS_SELECTOR, "#maptech-contact-form [type='submit']"
        ).click()

        self.assertEqual(
            self.driver.execute_script(
                "return window.__maptechAjaxCalls.length"
            ),
            0,
            "Native email validation should block submission before the handler.",
        )
        self.assertEqual(self.driver.current_url, original_url)
        self.assertFalse(
            self.driver.find_element(By.ID, "maptech-result-dialog").get_property(
                "open"
            )
        )

    def test_attachment_can_be_selected_without_submission(self):
        self.open_page("index.html")
        attachment_input = self.driver.find_element(
            By.ID, "maptech-attachment-input"
        )
        with tempfile.TemporaryDirectory(prefix="maptech-selenium-") as directory:
            attachment = Path(directory) / "selenium-test-attachment.xlsx"
            attachment.write_text("Local Selenium attachment test.\n", encoding="utf-8")
            attachment_input.send_keys(str(attachment))

        selected_file = self.wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, "#maptech-attachment-list li")
            )
        )
        self.assertIn("selenium-test-attachment.xlsx", selected_file.text)
        self.assertEqual(
            len(self.driver.find_elements(By.CSS_SELECTOR, "#maptech-attachment-list li")),
            1,
        )

    def test_valid_form_submission_uses_local_stub_and_closes_result_dialog(self):
        self.open_page("index.html")
        self.fill_required_contact_fields()
        self.install_local_ajax_stub()
        original_url = self.driver.current_url

        self.driver.find_element(
            By.CSS_SELECTOR, "#maptech-contact-form [type='submit']"
        ).click()

        dialog = self.driver.find_element(By.ID, "maptech-result-dialog")
        self.wait.until(lambda driver: dialog.get_property("open"))
        call = self.driver.execute_script(
            "return window.__maptechAjaxCalls[0]"
        )
        self.assertEqual(
            urlparse(call["url"]).scheme + "://" + urlparse(call["url"]).netloc,
            "https://formsubmit.co",
        )
        self.assertRegex(
            urlparse(call["url"]).path,
            r"^/ajax/[^/]+$",
        )
        self.assertEqual(call["method"], "POST")
        self.assertIn("name", call["fieldNames"])
        self.assertIn("email", call["fieldNames"])
        self.assertEqual(self.driver.current_url, original_url)
        self.assertEqual(
            self.driver.find_element(By.ID, "maptech-result-title").text,
            "Submission unsuccessful",
        )
        self.assertIn(
            "could not reach the email service",
            self.driver.find_element(By.ID, "maptech-result-message").text,
        )

        self.driver.find_element(By.ID, "maptech-result-close").click()
        self.wait.until(lambda driver: not dialog.get_property("open"))

    def test_zz_no_unexpected_javascript_errors(self):
        self.collect_browser_errors()
        self.assertEqual(
            self.browser_errors,
            [],
            "Unexpected severe browser errors:\n"
            + "\n".join(self.browser_errors),
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
