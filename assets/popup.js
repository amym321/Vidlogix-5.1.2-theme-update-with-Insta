// logic for popups including Media Drawer on PDP, UPS Map popup, Why Buy popup - am

window.onload = function(){ 

  // Why Buy popup
  var outerModal = document.getElementById("why-buy-popup");
  var btn = document.getElementById("why-buy-btn");   // trigger
  // UPS Map popup
  var mapModal = document.getElementById("map-popup");
  var mapBtn = document.getElementById("map-btn");    // trigger
  var mapBtn2 = document.getElementById("map-btn2");  // trigger
  // Media Drawer iframe
  var mediaDrawer = document.getElementById("media-drawer");
  var mediaDrwrOverlay = document.getElementById("media-drwr-overlay");
  var mediaBtnDesktop = document.querySelectorAll("#media-btn-desktop");   // iframe trigger only
  var mediaBtnMobile = document.querySelectorAll('#media-btn-mobile');     // acf <a> for link
  var mediaLinkDesktop = [];

  Object.keys(mediaBtnDesktop).forEach((key) => {
    mediaLinkDesktop[key] = mediaBtnDesktop[key].getAttribute("data-iframe-link");
    
    mediaBtnDesktop[key].onclick = function() {
      var mediaIframe = document.getElementById('media-iframe');
      mediaIframe.setAttribute('src', mediaLinkDesktop[key]);
      mediaDrawer.style.display = "block";
      mediaDrawer.classList.add('drawer--is-open');
      mediaDrwrOverlay.style.display = "block";
    }
  });

  if (btn != null){
    btn.onclick = function() {
      outerModal.style.display = "flex";
    }
  }

  if (mapBtn != null){
    mapBtn.onclick = function() {
      mapModal.style.display = "flex";
    }
  }

  if (mapBtn2 != null){
    mapBtn2.onclick = function() {
      mapModal.style.display = "flex";
    }
  }

  // toggles display of iframe and <a> link if both are present in acf metafields
  if (mediaBtnDesktop != null && mediaBtnMobile != null){
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      mediaBtnMobile.forEach(el => el.style.display = "inline-block");
      mediaBtnDesktop.forEach(el => el.style.display = "none");
    } else {
      mediaBtnMobile.forEach(el => el.style.display = "none");
      mediaBtnDesktop.forEach(el => el.style.display = "inline-block");
    }
  }

  document.addEventListener(
    "click",
    function(event) {
      // If user either clicks X button OR clicks outside the modal window, then close modal 
      if (
        event.target.matches(".close-why-popup") ||
        !event.target.closest("#why-modal-inner") && 
        event.target.matches("#why-outer-modal") ||
        !event.target.closest("#why-modal-inner") && 
        event.target.matches("#media-drwr-overlay")
      ) {
        closeModal()
      }
    },
    false
  )
   
  function closeModal() {
    if (outerModal != null) {
      outerModal.style.display = "none";
    }
    if (mapModal != null) {
      mapModal.style.display = "none";
    }
    if (mediaDrawer != null && mediaDrwrOverlay != null) {
      mediaDrawer.style.display = "none";
      mediaDrwrOverlay.style.display = "none";
    }
  }

}