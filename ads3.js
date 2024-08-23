// var videoElement;

// // On window load, attach an event to the play button click
// // that triggers playback on the video element
// window.addEventListener('load', function(event) {
//   videoElement = document.getElementById('video-element');
//   var playButton = document.getElementById('play-button');
//   playButton.addEventListener('click', function(event) {
//     videoElement.play();
//   });
// });

var videoElement;
// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;

window.addEventListener('load', function(event) {
  videoElement = document.getElementById('video-element');
  initializeIMA();
  videoElement.addEventListener('play', function(event) {
    loadAds(event);
  });
  var playButton = document.getElementById('play-button');
  playButton.addEventListener('click', function(event) {
    videoElement.play();
  });
});

window.addEventListener('resize', function(event) {
  console.log("window resized");
});

function initializeIMA() {
  console.log("initializing IMA");
  adContainer = document.getElementById('ad-container');
  adContainer.addEventListener('click', adContainerClick);
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false);
    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false);

    function adContainerClick(event) {
        console.log("ad container clicked");
        if(videoElement.paused) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
      }


  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener('ended', function() {
    adsLoader.contentComplete();
  });

  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/22893903952,22867292069/dgofiretv&description_url=https%3A%2F%2Fwww.amazon.com%2FDirecTV-Latin-America-DIRECTV-GO%2Fdp%2FB07P5HLXL3&tfcd=0&npa=0&ad_type=audio_video&sz=1x1%7C300x250%7C320x480%7C400x300%7C412x231%7C432x243%7C480x320%7C640x480%7C650x365%7C832x468%7C1280x720%7C1920x1080&min_ad_duration=1000&max_ad_duration=60000&gdfp_req=1&unviewed_position_start=1&correlator=[placeholder]&url=https%3A%2F%2Fwww.amazon.com%2FDirecTV-Latin-America-DIRECTV-GO%2Fdp%2FB07P5HLXL3&vpos=preroll&rdid=[placeholder]&is_lat=[placeholder]&idtype=afai&an=B07P5HLXL3&output=vast&hl=es&env=instream&wta=1&plcmt=1&vpa=auto&vpmute=0&ad_rule=0';

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

function loadAds(event) {
  // Prevent this function from running on if there are already ads loaded
  if(adsLoaded) {
    return;
  }
  adsLoaded = true;

  // Prevent triggering immediate playback when ads are loading
  event.preventDefault();

  console.log("loading ads");

   // Initialize the container. Must be done via a user action on mobile devices.
   videoElement.load();
   adDisplayContainer.initialize();
 
   var width = videoElement.clientWidth;
   var height = videoElement.clientHeight;
   try {
     adsManager.init(width, height, google.ima.ViewMode.NORMAL);
     adsManager.start();
   } catch (adError) {
     // Play the video without ads, if an error occurs
     console.log("AdsManager could not be started");
     videoElement.play();
   }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Instantiate the AdsManager from the adsLoader response and pass it the video element
    adsManager = adsManagerLoadedEvent.getAdsManager(
        videoElement);

    adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError);

    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        onAdLoaded);  

    function onAdLoaded(adEvent) {
        var ad = adEvent.getAd();
        if (!ad.isLinear()) {
            videoElement.play();
        }
          
  }
  
  function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    if(adsManager) {
      adsManager.destroy();
    }
  }

  function onContentPauseRequested() {
    videoElement.pause();
  }
  
  function onContentResumeRequested() {
    videoElement.play();
  }

  window.addEventListener('resize', function(event) {
    console.log("window resized");
    if(adsManager) {
      var width = videoElement.clientWidth;
      var height = videoElement.clientHeight;
      adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
    }
  });

}

init();