// Checks if the environment is Node.js, where the DOM is unavailable
const isNode = typeof document === "undefined" && typeof window === "undefined";

/**
 * Function that prevents screenshots and disables various interactions with the DOM to protect content.
 * @param {Object} options - Configuration options for screenshot prevention and interaction blocking.
 * @param {string} overlayId - The ID of the overlay element to be used for blocking screenshots (if applicable).
 */
function noScreenshot(options, overlayId) {
  // If the environment is Node.js, skip DOM manipulation and screenshot prevention
  if (isNode) {
    console.warn(
      "noScreenshot: DOM functions and screenshot prevention are not supported in Node.js"
    );
    return;
  }

  // Set default options if not provided
  options = options || {};

  const {
    disableRightClick = true, // Disables right-click context menu
    disableKeyboardShortcuts = true, // Disables certain keyboard shortcuts
    disableInspectElement = true, // Prevents inspection of elements via DevTools
    disablePrintScreen = true, // Disables the Print Screen key
    disableScreenshot = true, // Prevents screenshots
    disableFunctionKeys = true, // Disables function keys (F1, F2, etc.)
    disableCtrlF4 = true, // Disables Ctrl+F4 (closing tabs)
    mouseLeave = true, // Shows overlay when the mouse leaves the document window
    mouseEnterAutoHide = false, // Auto-hides overlay when the mouse re-enters the document window
    ctrlOverlay = true, // Displays overlay when Ctrl key is pressed
    altOverlay = false, // Displays overlay when Alt key is pressed
    shiftOverlay = false, // Displays overlay when Shift key is pressed
    clearConsole = true, // Clears the console at intervals to prevent debugging
    clearSensitiveContent = ["body"], // Elements to clear when dev tools are detected
  } = options;

  // Disable right-click functionality
  if (disableRightClick) {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  // Disable certain keyboard shortcuts (e.g., Ctrl+C, Ctrl+U, etc.)
  if (disableKeyboardShortcuts) {
    document.addEventListener("keydown", (event) => {
      // Prevents shortcuts such as Ctrl+C, Ctrl+U, Ctrl+I, etc.
      if (
        (event.ctrlKey && ["c", "u", "i", "j", "k", "s"].includes(event.key)) ||
        (event.metaKey && ["c", "u", "i", "j", "k", "s"].includes(event.key))
      ) {
        event.preventDefault();
      }
    });

    // Prevents the save shortcut (Ctrl+S or Meta+S)
    document.addEventListener("keydown", (event) => {
      if (
        (event.ctrlKey && event.shiftKey && event.key === "s") ||
        (event.ctrlKey && event.key === "s") ||
        (event.metaKey && event.shiftKey && event.key === "s") ||
        (event.metaKey && event.key === "s")
      ) {
        event.preventDefault();
      }
    });

    // Prevents inspection and development tools shortcuts (Ctrl+Shift+I, Ctrl+Shift+J, etc.)
    document.addEventListener("keydown", (event) => {
      if (
        (event.ctrlKey && event.shiftKey && ["i", "j"].includes(event.key)) ||
        (event.metaKey && event.shiftKey && ["i", "j"].includes(event.key)) ||
        (event.ctrlKey && ["i", "j"].includes(event.key)) ||
        (event.metaKey && ["i", "j"].includes(event.key))
      ) {
        event.preventDefault();
      }
    });

    // Disables other inspection-related shortcuts (e.g., Meta+Shift+I, Meta+Shift+J)
    document.addEventListener("keydown", (event) => {
      if (
        (event.metaKey && event.shiftKey && ["i", "j"].includes(event.key)) ||
        (event.metaKey && event.key === "s")
      ) {
        event.preventDefault();
      }
    });
  }

  if (disableInspectElement) {
    // Block specific keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      if (
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.metaKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.shiftKey && event.key === "C") ||
        (event.metaKey && event.shiftKey && event.key === "C") ||
        event.key === "F12"
      ) {
        event.preventDefault();
      }
    });

    document.addEventListener("contextmenu", (event) => event.preventDefault());

    // Clear the console every second
    if (clearConsole) {
      clearConsoleArea();
    }
    // Detect if the inspect element tool is open
    detectInspectElement(clearSensitiveContent, overlayId);
  }

  if (disablePrintScreen) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "PrintScreen") {
        event.preventDefault();
      }
    });
    document.addEventListener("keyup", (event) => {
      if (event.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        overlayScreen();
      }
    });
  }

  if (disableFunctionKeys) {
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "F1" ||
        event.key === "F2" ||
        event.key === "F3" ||
        event.key === "F5" ||
        event.key === "F6" ||
        event.key === "F7" ||
        event.key === "F8" ||
        event.key === "F9" ||
        event.key === "F10" ||
        event.key === "F11" ||
        event.key === "F12"
      ) {
        event.preventDefault();
      }
    });
  }

  if (disableCtrlF4) {
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "F4") {
        event.preventDefault();
      }
    });
  }

  if (mouseLeave) {
    document.addEventListener("mouseleave", () => {
      overlayScreen(overlayId);
    });
  }

  if (mouseEnterAutoHide) {
    document.addEventListener("mouseenter", () => {
      HideOverlayScreen(overlayId);
    });
  }

  if (ctrlOverlay) {
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey) {
        overlayScreen(overlayId);
      }
    });
  }

  if (altOverlay) {
    document.addEventListener("keydown", (event) => {
      if (event.altKey || event.optionsKey) {
        overlayScreen(overlayId);
      }
    });
  }

  if (shiftOverlay) {
    document.addEventListener("keydown", (event) => {
      if (event.shiftKey) {
        overlayScreen(overlayId);
      }
    });
  }

  if (clearConsole) {
    clearConsoleArea();
  }

  // Disable pointer events on the body while the overlay is active
  document.body.style.pointerEvents = "auto";
  document.addEventListener("keydown", escListener);

  // Prevent screenshots on mobile devices
  window.addEventListener("touchstart", handleTouchStart);

  function escListener(event) {
    if (event.key === "Escape") {
      HideOverlayScreen(overlayId, clearSensitiveContent);
    }
  }
}

function overlayScreen(overlayId) {
  if (overlayId) {
    const customOverlay = document.getElementById(overlayId);
    if (customOverlay) {
      customOverlay.style.position = "fixed";
      customOverlay.style.top = "0";
      customOverlay.style.left = "0";
      customOverlay.style.width = "100%";
      customOverlay.style.height = "100%";
      customOverlay.style.zIndex = "9999";
      customOverlay.style.display = "block";
      customOverlay.style.alignItems = "center";
      customOverlay.style.justifyContent = "center";

      // Disable pointer events on the body while the overlay is visible
      document.body.style.pointerEvents = "none";

      document.addEventListener("keydown", escListener);

      function escListener(event) {
        if (event.key === "Escape") {
          customOverlay.style.display = "none"; // Hide the custom overlay and restore pointer events on the body
          document.body.style.pointerEvents = "auto"; // Re-enable pointer events on body
          document.removeEventListener("keydown", escListener);
        }
      }

      return;
    }
  }

  if (document.getElementById("no-screenshot-overlay")) {
    document.getElementById("no-screenshot-overlay").style.display = "flex";
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "no-screenshot-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(255, 255, 255, 1)"; // semi-transparent white background
  overlay.style.zIndex = "9999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const message = document.createElement("div");
  message.textContent = "Press Esc to close. Screenshots are disabled.";
  message.style.fontSize = "24px";
  message.style.color = "black"; // You can adjust the color as needed
  message.style.padding = "20px"; // Add padding to the message
  message.style.background = "rgba(255, 255, 255, 0.9)"; // semi-transparent white background for message
  message.style.borderRadius = "10px"; // Rounded corners for the message box
  message.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)"; // Drop shadow for the message box

  overlay.appendChild(message);
  document.body.appendChild(overlay);
  document.body.style.pointerEvents = "none";
}

function HideOverlayScreen(overlayId, clearSensitiveContent = false) {
  if (overlayId) {
    const customOverlay = document.getElementById(overlayId);
    if (customOverlay) {
      customOverlay.style.display = "none"; // Hide the custom overlay
      document.body.style.pointerEvents = "auto"; // Re-enable pointer events on body
      if (clearSensitiveContent) {
        location.reload();
      }
      return;
    }
  }
  if (clearSensitiveContent) {
    location.reload();
  }
  var overlay = document.getElementById("no-screenshot-overlay");
  document.body.removeChild(overlay);
  document.body.style.pointerEvents = "auto"; // Re-enable pointer events on body
}

function clearConsoleArea() {
  var checkStatus;
  var element = document.createElement("any");
  element.__defineGetter__("id", function () {
    checkStatus = "on";
  });

  setInterval(function () {
    checkStatus = "off";
    console.log(element);
    console.clear();
  }, 1000);
}

function clearSensitiveData(selector) {
  if (selector) {
    if (Array.isArray(selector)) {
      selector.forEach((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach((el) => (el.innerHTML = ""));
      });
    } else if (typeof selector === "string") {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = "";
      }
    } else {
      const element = document.querySelector("body");
      element.innerHTML = "";
    }
  }
}

function detectInspectElement(clearSensitiveContent, overlayId) {
  let threshold =
    Math.max(
      window.outerWidth - window.innerWidth,
      window.outerHeight - window.innerHeight
    ) + 10;
  let devtoolsOpen = false;

  // Function to check if DevTools is open
  const isDevToolsOpen = () => {
    const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
    const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
    console.log("widthDiff", widthDiff);
    console.log("heightDiff", heightDiff);

    // Check for width or height differences above threshold
    return widthDiff > threshold || heightDiff > threshold;
  };

  // Function to check for debugger
  const detectDebugger = () => {
    const start = Date.now();
    debugger; // This will pause if DevTools is open
    const end = Date.now();
    return end - start > 100; // If more than 100ms passed, DevTools is likely open
  };

  // Function to detect DevTools and take action
  const detectDevTools = () => {
    if (isDevToolsOpen() || detectDebugger()) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        alert("Developer tools are open!");
        console.warn("Developer tools are open!");
        clearSensitiveData(clearSensitiveContent);
        overlayScreen(overlayId);
      }
    } else {
      if (devtoolsOpen) {
        devtoolsOpen = false;
        HideOverlayScreen(overlayId, clearSensitiveContent);
      }
    }
  };

  // Initial check and setInterval to keep checking
  detectDevTools();
  setInterval(detectDevTools, 1000);
}

function handleTouchStart(event) {
  const now = new Date().getTime();
  const timeSinceLastTouch = now - lastTouchTime;
  lastTouchTime = now;

  // Check if it's a three-finger touch and the time interval between touches is short
  if (event.touches.length === 3 && timeSinceLastTouch < 250) {
    event.preventDefault();

    alert("Three-finger screenshot prevented");
  }
}

if (isNode) {
  module.exports = noScreenshot;
} else {
  window.noScreenshot = noScreenshot;
}
