const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';
let recaptchaLoaderPromise = null;

const cleanupReCaptchaBadges = () => {
  document.querySelectorAll('.grecaptcha-badge').forEach((node) => node.remove());
};

const ensureReCaptchaScript = (siteKey) => {
  const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
  if (existingScript) {
    return existingScript;
  }

  const script = document.createElement('script');
  script.id = RECAPTCHA_SCRIPT_ID;
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  document.body.appendChild(script);
  return script;
};

// Loads reCAPTCHA v3 and returns grecaptcha.
export function loadReCaptchaV3(siteKey) {
  if (window.grecaptcha && window.grecaptcha.execute) {
    return Promise.resolve(window.grecaptcha);
  }

  if (recaptchaLoaderPromise) {
    return recaptchaLoaderPromise;
  }

  recaptchaLoaderPromise = new Promise((resolve, reject) => {
    const script = ensureReCaptchaScript(siteKey);

    const onLoaded = () => {
      if (window.grecaptcha && window.grecaptcha.execute) {
        resolve(window.grecaptcha);
      } else {
        recaptchaLoaderPromise = null;
        reject(new Error('reCAPTCHA v3 failed to load'));
      }
    };

    if (script.getAttribute('data-loaded') === 'true') {
      onLoaded();
      return;
    }

    script.addEventListener('load', () => {
      script.setAttribute('data-loaded', 'true');
      onLoaded();
    }, { once: true });
    script.addEventListener('error', (err) => {
      recaptchaLoaderPromise = null;
      reject(err);
    }, { once: true });
  });

  return recaptchaLoaderPromise;
}

// Preload reCAPTCHA only for auth pages.
export async function mountReCaptchaV3(siteKey) {
  if (!siteKey) return;
  await loadReCaptchaV3(siteKey);
}

// Remove script/badge so reCAPTCHA does not appear outside auth pages.
export function unmountReCaptchaV3() {
  const script = document.getElementById(RECAPTCHA_SCRIPT_ID);
  if (script) script.remove();

  cleanupReCaptchaBadges();
  recaptchaLoaderPromise = null;

  try {
    delete window.grecaptcha;
  } catch {
    window.grecaptcha = undefined;
  }
}

export async function getReCaptchaV3Token(siteKey, action = 'submit') {
  const grecaptcha = await loadReCaptchaV3(siteKey);
  return grecaptcha.execute(siteKey, { action });
}
