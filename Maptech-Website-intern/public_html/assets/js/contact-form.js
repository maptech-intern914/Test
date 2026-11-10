(function () {
  var form = document.getElementById('maptech-contact-form');
  if (!form) {
    return;
  }

  var fileInput = document.getElementById('maptech-attachment-input');
  var dropArea = document.getElementById('maptech-attachment-drop');
  var fileList = document.getElementById('maptech-attachment-list');
  var linkInput = document.getElementById('maptech-link-input');
  var linkList = document.getElementById('maptech-link-list');
  var status = document.getElementById('maptech-form-status');
  var resultDialog = document.getElementById('maptech-result-dialog');
  var resultTitle = document.getElementById('maptech-result-title');
  var resultMessage = document.getElementById('maptech-result-message');
  var resultIcon = document.getElementById('maptech-result-icon');
  var resultClose = document.getElementById('maptech-result-close');
  var submitButton = form.querySelector('[type="submit"]');
  var subjectInput = form.querySelector('[name="_subject"]');
  var replyToInput = form.querySelector('[name="_replyto"]');
  var nextInput = document.getElementById('maptech-form-next');
  var fileLinksInput = document.getElementById('maptech-file-links');
  var files = [];
  var links = [];
  var maxUploadSize = 10 * 1024 * 1024;
  var allowedFileExtensions = /\.(pdf|docx|jpe?g|png|webp)$/i;
  var characterLimits = {
    name: 100,
    position: 100,
    company: 150,
    email: 254,
    message: 3000
  };

  Object.keys(characterLimits).forEach(function (fieldName) {
    form.elements[fieldName].maxLength = characterLimits[fieldName];
  });

  fileInput.accept = '.pdf,.docx,.jpg,.jpeg,.png,.webp';

  function showResult(isSuccess, message) {
    resultDialog.classList.toggle('is-error', !isSuccess);
    resultTitle.textContent = isSuccess ? 'Inquiry sent' : 'Submission unsuccessful';
    resultMessage.textContent = message;
    resultIcon.textContent = isSuccess ? '\u2713' : '!';
    resultClose.textContent = isSuccess ? 'Close' : 'Return to form';
    if (!resultDialog.hasAttribute('open')) {
      if (typeof resultDialog.showModal === 'function') {
        resultDialog.showModal();
      } else {
        resultDialog.classList.add('is-fallback');
        resultDialog.setAttribute('open', '');
        resultClose.focus();
      }
    }
  }

  function closeResult() {
    if (typeof resultDialog.close === 'function' && resultDialog.open) {
      resultDialog.close();
    } else {
      resultDialog.removeAttribute('open');
      resultDialog.classList.remove('is-fallback');
    }
    submitButton.focus();
  }

  function renderList(list, values, removeValue) {
    list.textContent = '';
    values.forEach(function (value, index) {
      var item = document.createElement('li');
      var text = document.createElement('span');
      var remove = document.createElement('button');
      text.textContent = value;
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + value);
      remove.addEventListener('click', function () {
        removeValue(index);
      });
      item.appendChild(text);
      item.appendChild(remove);
      list.appendChild(item);
    });
  }

  function renderFiles() {
    renderList(fileList, files.map(function (file) {
      return file.name + ' (' + Math.ceil(file.size / 1024) + ' KB)';
    }), function (index) {
      files.splice(index, 1);
      renderFiles();
    });
  }

  function addFiles(incoming) {
    var rejectedFiles = [];
    Array.prototype.forEach.call(incoming, function (file) {
      if (!allowedFileExtensions.test(file.name)) {
        rejectedFiles.push(file.name);
        return;
      }
      if (!files.some(function (existing) {
        return existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified;
      })) {
        files.push(file);
      }
    });
    if (rejectedFiles.length) {
      fileInput.value = '';
      status.textContent = 'Only PDF, DOCX, JPG, JPEG, PNG, and WEBP files can be attached.';
      status.classList.add('is-error');
    }
    renderFiles();
  }

  function renderLinks() {
    renderList(linkList, links, function (index) {
      links.splice(index, 1);
      renderLinks();
    });
  }

  function setRecipient() {
    var recipient = form.elements.service.value === 'Technical Support'
      ? 'https://formsubmit.co/63a0b473ffb174fcd7b14a118b5b0bdb'
      : 'https://formsubmit.co/907fd4384d7575e2e4eb3430ec7e71df';
    form.action = recipient;
    return recipient;
  }

  function getAjaxRecipient() {
    return setRecipient().replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
  }

  function selectedFilesMatch() {
    if (fileInput.files.length !== files.length) {
      return false;
    }
    return files.every(function (file, index) {
      var selected = fileInput.files[index];
      return selected.name === file.name &&
        selected.size === file.size &&
        selected.lastModified === file.lastModified;
    });
  }

  function setReturnUrl() {
    var returnUrl = new URL('/', window.location.origin);
    returnUrl.searchParams.set('contact', 'success');
    returnUrl.hash = 'contact-us';
    nextInput.value = returnUrl.href;
  }

  function showSuccessAfterRedirect() {
    if (window.top !== window || new URLSearchParams(window.location.search).get('contact') !== 'success') {
      return;
    }
    var cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('contact');
    window.history.replaceState(null, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    showResult(true, 'Thank you. Your inquiry has been sent successfully.');
  }

  fileInput.addEventListener('change', function () {
    addFiles(fileInput.files);
  });

  form.addEventListener('invalid', function (event) {
    if (event.target.name === 'message' && event.target.validity.tooLong) {
      status.textContent = 'Your message must be 3,000 characters or fewer.';
      status.classList.add('is-error');
    }
  }, true);

  ['dragenter', 'dragover'].forEach(function (eventName) {
    dropArea.addEventListener(eventName, function (event) {
      event.preventDefault();
      dropArea.classList.add('is-dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (eventName) {
    dropArea.addEventListener(eventName, function (event) {
      event.preventDefault();
      dropArea.classList.remove('is-dragover');
    });
  });
  dropArea.addEventListener('drop', function (event) {
    if (event.dataTransfer && event.dataTransfer.files) {
      addFiles(event.dataTransfer.files);
    }
  });

  document.getElementById('home-add-link').addEventListener('click', function () {
    var link = linkInput.value.trim();
    if (!link) {
      linkInput.focus();
      return;
    }
    try {
      var parsedLink = new URL(link);
      if (parsedLink.protocol !== 'https:' && parsedLink.protocol !== 'http:') {
        throw new Error('Unsupported link type');
      }
      if (!links.includes(parsedLink.href)) {
        links.push(parsedLink.href);
      }
      linkInput.value = '';
      renderLinks();
      status.textContent = '';
      status.classList.remove('is-error');
    } catch (error) {
      status.textContent = 'Enter a valid web link beginning with http:// or https://.';
      status.classList.add('is-error');
    }
  });

  linkInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('home-add-link').click();
    }
  });

  resultClose.addEventListener('click', function () {
    closeResult();
  });
  resultDialog.addEventListener('click', function (event) {
    if (event.target === resultDialog) {
      closeResult();
    }
  });
  resultDialog.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && resultDialog.classList.contains('is-fallback')) {
      event.preventDefault();
      closeResult();
    }
  });

  form.querySelectorAll('[name="service"]').forEach(function (option) {
    option.addEventListener('change', setRecipient);
  });
  form.addEventListener('submit', function (event) {
    setRecipient();
    subjectInput.value = form.elements.service.value + ' - ' + document.getElementById('home-company').value.trim();
    var totalFileSize = files.reduce(function (total, file) {
      return total + file.size;
    }, 0);
    if (totalFileSize > maxUploadSize) {
      status.textContent = '';
      showResult(false, 'The combined size of your attachments exceeds 10 MB. Remove some files and try again.');
      return;
    }
    replyToInput.value = form.elements.email.value.trim();
    fileLinksInput.value = links.join('\n');
    status.classList.remove('is-error');
    status.textContent = 'Sending your inquiry...';

    if (!files.length || selectedFilesMatch()) {
      setReturnUrl();
      submitButton.disabled = true;
      return;
    }

    event.preventDefault();
    form.action = getAjaxRecipient();
    submitButton.disabled = true;

    var payload = new FormData(form);
    payload.delete('attachment');
    files.forEach(function (file) {
      payload.append('attachment', file, file.name);
    });

    window.jQuery.ajax({
      url: form.action,
      method: 'POST',
      data: payload,
      processData: false,
      contentType: false,
      dataType: 'json',
      headers: { Accept: 'application/json' }
    }).done(function (response) {
      if (response && (response.success === true || response.success === 'true')) {
        form.reset();
        files = [];
        links = [];
        renderFiles();
        renderLinks();
        setRecipient();
        status.textContent = '';
        showResult(true, 'Thank you. Your inquiry has been sent successfully.');
      } else {
        var responseMessage = response && (response.message || response.error);
        showResult(false, responseMessage
          ? 'The email service rejected the inquiry: ' + responseMessage
          : 'We could not confirm that your inquiry was sent. Please try again or contact us directly.');
      }
    }).fail(function (request) {
      var responseMessage = request.responseJSON && (request.responseJSON.message || request.responseJSON.error);
      showResult(false, responseMessage
        ? 'The email service could not process the inquiry: ' + responseMessage
        : 'The submission could not reach the email service. Check your connection or browser privacy settings, then try again.');
    }).always(function () {
      submitButton.disabled = false;
      status.textContent = '';
    });
  });

  setRecipient();
  showSuccessAfterRedirect();
}());
