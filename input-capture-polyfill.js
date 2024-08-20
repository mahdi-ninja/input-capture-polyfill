document.addEventListener('DOMContentLoaded', function () {
  var captureButtonContent = '<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none"><path transform="matrix(3.33 0 0 3.33 .03 3.36)" d="M9 6.22A2.71 2.71 0 0 0 6.3 8.9 2.71 2.71 0 0 0 9 11.56c1.47 0 2.7-1.22 2.7-2.67A2.71 2.71 0 0 0 9 6.22Z" fill="#26303A"/><path transform="matrix(3.33 0 0 3.33 .03 3.36)" d="M16.2 2.67h-2.33L11.43.26A.9.9 0 0 0 10.8 0H7.2c-.24 0-.47.1-.64.26l-2.43 2.4H1.8c-.99 0-1.8.8-1.8 1.78v9.78C0 15.2.81 16 1.8 16h14.4c.99 0 1.8-.8 1.8-1.78V4.44a1.8 1.8 0 0 0-1.8-1.77ZM9 13.33A4.53 4.53 0 0 1 4.5 8.9c0-2.41 2.06-4.45 4.5-4.45s4.5 2.04 4.5 4.45c0 2.4-2.06 4.44-4.5 4.44Z" fill="#26303A"/></svg>';
  var closeButtonContent = '<?xml version="1.0" encoding="utf-8"?><svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var switchButtonContent = '<?xml version="1.0" encoding="utf-8"?><svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  if (!('capture' in document.createElement('input')) &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    navigator.mediaDevices.enumerateDevices) {

    var targetInput, stream, videoDevices = [], currentDeviceIndex = 0;

    var video = addCustomElement('video', null, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 99999,
      backgroundColor: 'black',
      display: 'none'
    });

    var captureButton = addCustomElement('button', captureButtonContent, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '85px',
      height: '85px',
      borderRadius: '50%',
      border: '5px solid white',
      backgroundColor: 'white',
      zIndex: 100000,
      display: 'none'
    }, {
      click: handleCapture
    });

    var closeButton = addCustomElement('button', closeButtonContent, {
      position: 'fixed',
      top: '20px',
      left: '20px',
      height: '30px',
      width: '30px',
      padding: '0',
      color: 'white',
      backgroundColor: 'black',
      opacity: '70%',
      borderRadius: '50%',
      border: 'none',
      zIndex: 100000,
      display: 'none'
    }, {
      click: cleanup
    });

    var switchCameraButton = addCustomElement('button', switchButtonContent, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      height: '30px',
      width: '30px',
      padding: '0',
      color: 'white',
      backgroundColor: 'black',
      opacity: '70%',
      borderRadius: '50%',
      border: 'none',
      zIndex: 100000,
      display: 'none'
    }, {
      click: handleSwitchCamera
    });

    function handleSwitchCamera() {
      if (videoDevices && videoDevices.length > 0) {
        currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
        startStream(videoDevices[currentDeviceIndex].deviceId);
      }
    }

    function handleCapture() {
      if (!targetInput || !video) return;
      var canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function (blob) {
        if (!blob) {
          alert('Failed to capture image.');
          cleanup();
          return;
        }

        var timestamp = Math.floor(Date.now() / 1000);
        var file = new File([blob], "capture" + timestamp + ".jpg", { type: "image/jpeg" });
        var dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        targetInput.files = dataTransfer.files;
        targetInput.dispatchEvent(new Event('change'));

        cleanup();
      }, 'image/jpeg');
    }

    function startStream(deviceId) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId } })
        .then(function (mediaStream) {
          stream = mediaStream;
          video.srcObject = stream;
          video.play();
        })
        .catch(function (error) {
          console.error('Error accessing media devices.', error);
          alert('Unable to access camera. Please ensure you have granted camera permissions.');
          cleanup();
        });
    };

    function cleanup() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (video) {
        video.srcObject = null;
        video.style.display = 'none';
      }
      if (captureButton) {
        captureButton.style.display = 'none';
      }
      if (closeButton) {
        closeButton.style.display = 'none';
      }
      if (switchCameraButton) {
        switchCameraButton.style.display = 'none';
      }
      targetInput = null;
    }

    document.addEventListener('click', function (event) {
      if (event.target.tagName === 'INPUT' && event.target.type === 'file' && event.target.hasAttribute('capture')) {
        targetInput = event.target;
        event.preventDefault();

        video.style.display = 'block';
        captureButton.style.display = 'block';
        closeButton.style.display = 'block';

        // Enumerate Devices
        navigator.mediaDevices.enumerateDevices()
          .then(function (devices) {
            videoDevices = devices.filter(device => device.kind === 'videoinput');
            if (videoDevices.length > 0) {

              if (videoDevices.length > 1) {
                switchCameraButton.style.display = 'block';
              }

              startStream(videoDevices[currentDeviceIndex].deviceId);
            } else {
              alert('No video input devices found.');
              cleanup();
            }
          })
          .catch(function (error) {
            console.error('Error enumerating devices.', error);
            alert('Unable to enumerate devices.');
            cleanup();
          });
      }
    });

    function addCustomElement(tagName, innerHTML, styles, eventHandlers) {
      var element = document.createElement(tagName);
      if (innerHTML) {
        element.innerHTML = innerHTML;
      }
      if (styles) {
        Object.assign(element.style, styles);
      }
      if (eventHandlers) {
        Object.keys(eventHandlers).forEach(function (eventName) {
          element.addEventListener(eventName, eventHandlers[eventName]);
        });
      }
      document.body.appendChild(element);
      return element;
    }

  }
});
