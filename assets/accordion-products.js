
 $(document).ready(function() {

    //Hides and Shows accordion content
    $('.accordion-section').on('click', '.accordion', function(e){
       e.preventDefault(); //prevent default action of a button
       $(this) //get the element the user clicked on
         .toggleClass('opened')
         .toggleClass('closed')
         .next('.container') //select the next accordion panel
         .not(':animated') //if it is not currently animating
         .slideToggle(); //use slideToggle to show or hide it
     });
 
    //Makes tabs active
     $('ul.tabs').each(function(){
       var active, content, links = $(this).find('a');
       active = links.first().addClass('active');
       content = $(active.attr('href'));
       links.not(':first').each(function () {
         $($(this).attr('href')).hide();
       });
       $(this).find('a').click(function(e){
         active.removeClass('active');
         content.hide();
         active = $(this);
         content = $($(this).attr('href'));
         active.addClass('active');
         content.show();
         return false;
       });
     });
 
 //====== POPULATES THE ACCORDION QUICKNAV =========//
 
     $('.accordion-section .accordion').each(function(){
       var id = $(this).attr('id');
       var title = $('.accordion-title', this).text();
 
       $(".accordion-quicknav ul").append("<li><a href='#" + id + "'>" + title + "</a></li>");
 
     });
 
 
 
 //====== QUICKNAV ACTIVE STATE BASED ON SCROLL DEPTH =========//
 
 
     // Variables & Selectors
     var lastId,
         accordionMenu = $(".accordion-quicknav"),
         topMenuHeight = accordionMenu.outerHeight() + 30,
         // All list items
         menuItems = accordionMenu.find("a"),
         // Anchors corresponding to menu items
         scrollItems = menuItems.map(function(){
           var item = $($(this).attr("href"));
           if (item.length) { return item; }
         }),
         section = $('.accordion-section'),
         state = 'rest',
         lastLinkActive,
         lastElemActiveTop;
 
 
 
 
      // Make active menu items visible on mobile (horizontal scroll effect)
      function ShowMenuItem(elem) {
        var item = $($(elem).attr("href"));
        if (item.length) {
        // Get position of the nav bar and the position of the link with the matching ID
         var navPosition = $(".accordion-quicknav ul").scrollLeft(),
             elemPosition = $(elem).offset().left;
 
         // Add the two together to get your scroll distance and animate
         $(".accordion-quicknav ul").animate({scrollLeft: navPosition + elemPosition - 10}, 400);
        }
      }
 
 
     // Bind click handler to menu items
     // so we can get a fancy scroll animation
     menuItems.click(function(e){
 
       // Set state to click so actions don't get repeated on scroll function below
       state = 'click';
       setTimeout( function() { state = 'rest' }, 500);
 
 
       var href = $(this).attr("href"),
           offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
 
 
       $('html, body').stop().animate({
           scrollTop: offsetTop
       }, 400);
       e.preventDefault();
 
       ShowMenuItem(this);
 
       menuItems
          .removeClass("active")
          $(this).addClass("active");
 
       //Open accordion if it's closed
       if ($(href).hasClass('closed')) {
         $(href).trigger( "click" );
       }
     });
 
     // Bind to scroll
     $(window).scroll(function(){
 
 
        // Get container scroll position
        var fromTop = $(this).scrollTop()+topMenuHeight;
 
       if (section.length) {
         sectionBottom = section.offset().top + section.height();
 
 
          // Get id of current scroll item
          var cur = scrollItems.map(function(){
            if ($(this).offset().top < fromTop && fromTop < sectionBottom )
              return this;
          });
 
          // Get the id of the current element
          cur = cur[cur.length-1];
          var id = cur && cur.length ? cur[0].id : "";
 
          if (lastId !== id && state != 'click') {
              lastId = id;
              // Set/remove active class
              menuItems
                .removeClass("active")
                .end().find("[href='#"+id+"']").addClass("active");
              var elem = $("[href='#"+id+"'].active");
 
              ShowMenuItem(elem);
          }
 
        }
 
     });
 
     //REMOVED PROTECTION PLAN FROM RECOMMENDED Products
     // setTimeout(function(){
     //   $('.product-recommendations [data-product-id="4389426856003"]').remove();
     //   $('.product-recommendations #QuickShopModal-4389426856003').remove();
     // }, 3000);
 
    //Scrolls down and opens reviews when stars in the product description are clicked
    $('.product-single__review-link.animate-scroll').click(function(event){
      event.preventDefault();
      var top = $("#reviews").offset().top;
 
      $([document.documentElement, document.body]).animate({
         scrollTop: top -50
     }, 1000);
 
     setTimeout(function(){
       $(".accordion.closed#reviews").trigger( "click" );
     }, 1100);
    });
 
   });
 