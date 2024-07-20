/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
(function () {
    // Setup global variables
    var beat = true;
    var m_tenant = window.echo_tenant.replace('echoglobal2.org', 'echoglobal.org');
    var base_url = "https://" + m_tenant + "/client/websites/";
    var uuid = window.echo_uuid;
    var full_url = base_url + uuid;
    var chat_data = {};
    
    var isEmbededChat = window.echo_embeded_chat || false;
    var latest_id = 0;
    window.isMobile = /iphone|ipod|ipad|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase());
    window.loadEmbedly = function(){
      $('.embedded:not(.loaded)').embedly({query: {maxwidth: 300}}).addClass('loaded');
    };
    
    
    var isWindowFocused = true;
    var submittingNewChat = false;
    var clientToken = getCookie('client_session_token');
    var timeSinceLastInteraction = 0;
    var idleTimeout = 15; //seconds
    var offlineTimeout = 45; //seconds
    var originalTitle = document.title;
    var unreadChatCount = 0;
    var heartbeatsStarted = false;
    var missedSubmittable = true;
    
    // Load jQuery if its not already loaded
    var jQuery;
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.0') {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type","text/javascript");
        script_tag.setAttribute("src",
            "https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js");
        if (script_tag.readyState) {
          script_tag.onreadystatechange = function () { // For old versions of IE
              if (this.readyState === 'complete' || this.readyState === 'loaded') {
                  scriptLoadHandler();
              }
          };
        } else { // Other browsers
          script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        main();
    }
    
    function notificationsRead() {
      console.log("notificationsRead");
      notificationButton = $('#echo-unread-messages');
      notificationButton.text("" );
      unreadChatCount = 0;
      notificationButton.hide();
    }
    
    // Called once jquery loads
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        main();
    }
    
    // Main function
    function main() {
      jQuery(document).ready(function() {
        $ = jQuery;
        loadFaye(function(){
          loadInitialChatHTML();
        });
        setupAjax();
      });
    }
    
    function sendWaitingHeartbeat(){
      if(window.chat_uuid && window.chat_uuid != -1){
        $.ajax({
          type: "POST",
          url: full_url + '/full_frame_chats/heartbeat?uuid=' + window.chat_uuid,
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error: ' + errorThrown);
          },
          success: function(data, textStatus, request) {
            if(data.status == "active"){
              chatHasBeenClaimed()
            }
          }
        });
      }
    }
    
    function startWaitingHeartbeat(){
      sendWaitingHeartbeat();
      if (!window.waiting_heartbeat){
        window.waiting_heartbeat = setInterval(function() {
            if(window.noHeartbeats){
              clearInterval(window.waiting_heartbeat);
              return;
            }
            return sendWaitingHeartbeat();
          }, 1000);
      }
    }
    
    
    function startHeartbeats(){
      if(heartbeatsStarted || window.chat_uuid === undefined){
        return;
      }
      heartbeatsStarted = true;
      startWaitingHeartbeat();
    }
    
    function setupAjax () {
      $.ajaxSetup({
        crossDomain: true,
        xhrFields: {
          withCredentials: false
        },
        data: {
          client_token: clientToken
        }
      });
    }
    
    function loadInitialChatHTML() {
      /*
      /
      / Initially, we'll fetch the data specific to this chat.
      / Following that, we'll load the HTML based on styling
      /
      */
    
    
      $.ajax({
        type: "GET",
        url: full_url + '/custom_stylesheet.css',
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error: ' + errorThrown);
        },
        success: function(data, textStatus, request) {
          styling = data;
          $.ajax({
        type: "GET",
        url: full_url + '/client_styling.json',
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error: ' + errorThrown);
        },
        success: function(data, textStatus, request) {
          chat_data = data;
    
          $(".js-widget").load(full_url + '/full_frame_chats?state=' + window.echo_chat_state || '', function() {
    
            // As long as there are required inputs, disable submit
            if ($(".js-chat-required-true").size() > 0){
              disableSubmit();
            }
    
    
            if(window.chat_uuid){
              startHeartbeats();
            }
            // $(this).addClass('cleanslate');
            log("Initial Chat Load");
    
            // If there are no agents available, we'll remove the chat buttons
    
            overlay(!window.echo_chat_state); // when we are showing a specific state. default to show. otherwise, default to hide.
            if (!chat_data.show_button) {
              $('#echo-chat-widget-panel-button').hide();
              $('#echo-chat-button').hide();
    
            }
    
          });
    
          // Load the rest
          loadCSS();
          setupEventHandlers();
    
          show_privacy_policy = window.location.search == "?show_privacy_policy=true";
          // console.log(show_privacy_policy);
          if (show_privacy_policy){
           loadPrivacyPolicy();
          }
    
          $('head').append('<style>' + styling + '</style>'); // append custom css last 
        }
      });
    
        }
      });
    }
    
    function loadCSS() {
      // Set css href based on style and set some specific css attributes
      var css_href = "https://" + m_tenant + "/widgets/full_frame_widget.css?v=1.1";
      if (chat_data.style_type == 'Overlay') {
        css_href = "https://" + m_tenant + "/widgets/overlay_widget.css?v=1.1";
      } else if (chat_data.style_type == 'Panel') {
        css_href = "https://" + m_tenant + "/widgets/panel_widget.css?v=1.1";
      }
    
      var css_link = $('<link>', {
        rel: "stylesheet",
        type: "text/css",
        href: css_href
      });
      var font_link = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: "https://fonts.googleapis.com/css?family=Open+Sans:300,400,700"
      });
      var cleanslate = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: "https://" + m_tenant + "/widgets/cleanslate.css"
      });
      var fontawesome = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: "https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
      });
      // cleanslate.appendTo('head');
      css_link.appendTo('head');
      font_link.appendTo('head');
      fontawesome.appendTo('head');
    
      if(isEmbededChat) {
        var embeded_css_link = $('<link>', {
          rel: 'stylesheet',
          type: 'text/css',
          href: "https://" + m_tenant + "/widgets/full_frame_embed.css"
        });
        embeded_css_link.appendTo('head');
      }
    
      if (chat_data.style_type == 'Overlay') {
        var location = chat_data.location;
        var position = chat_data.position;

      }
    }
    
    function loadFaye(callback) {
      $.ajax({
        type: "GET",
        url: full_url + '/faye_location',
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error: ' + errorThrown);
        },
        success: function(data, textStatus, request) {
          // console.dir(data);
          $.ajax({
            url: data["url"]+"/client.js",
            dataType: "script",
            success: function() {
              // console.log('doing the sneaky callback', data["url"]);
              callback();
            }
          });
        }
      });
    }
    
    function overlay(hide) {
      if (chat_data.style_type == 'Overlay') {
        // Dynamic button placement
        var location = chat_data.location;
        var position = chat_data.position;
        var chatButton = document.getElementById('echo-chat-button');
    
        if (location == 'top') {
          $('#echo-chat-button').css('bottom', '-22px');
          $('#echo-chat-button').css('left', '0');
          $('#echo-chat-button').css('border-radius', '0 0 5px 5px');
        } else if (location == 'bottom') {
          $('#echo-chat-button').css('bottom', '15px');
          $('#echo-chat-button').css('top', 'unset');
          $('#echo-chat-button').css('right', '0px');
          $('#echo-chat-button').css('left', 'unset');
        } else if (location == 'left') {
          $('#echo-chat-button').css('top', '39px');
          $('#echo-chat-button').css('right', '-60px');
          $('#echo-chat-button').css('-ms-transform', 'rotate(90deg)'); /* IE 9 */
          $('#echo-chat-button').css('-webkit-transform', 'rotate(90deg)'); /* Safari */
          $('#echo-chat-button').css('transform', 'rotate(90deg)');
        } else if (location == 'right') {
          chatButton.style['transform'] = 'rotate(270deg)';
          chatButton.style.left = '-60px';
          chatButton.style.top = '39px';
        }
    
        chatButton.style.display = 'inline-block';
        chatButton.style.cursor = 'pointer';
        $('.echo-chat-widget').append(chatButton);
    
        if (hide) {
          $('#echo-chat-main-container').css('display', 'none');
        }
    
        $('#echo-chat-button').click(function() {
          notificationButton = $('#echo-unread-messages')
          downButtonIcon = $('#echo-down-arrow');
          chatButtonIcon = $('#echo-chat-icon');
          if ($('#echo-chat-main-container').css('display') == 'none') {
            $('#echo-chat-main-container').css('display', 'inline-block');
            notificationButton.hide()
            chatButtonIcon.hide()
            downButtonIcon.show()
            notificationsRead();
          } else {
            chatButtonIcon.show()
            downButtonIcon.hide()
            $('#echo-chat-main-container').css('display', 'none');
            if(unreadChatCount > 0){
              notificationButton.show()
            }
            
          }
          autoScroll();
        });
      } else if (chat_data.style_type == 'Panel') {
        // Hide the overlay button (need to redo this)
        // document.getElementById('echo-chat-button').style.display = 'none';
    
        if (hide) {
          // $('.echo-chat-widget').css('background-color', 'none');
          $('.echo-chat-widget').css('display', 'none');
          $('#echo-chat-main-container').css('display', 'none');
          $('body').removeClass('noscroll-echo');
          pButton = document.createElement('DIV');
          if(chat_data.icon_url){
            pButton.innerHTML = '<img src="' + chat_data.icon_url + '" ></img>';
          } else {
            pButton.style.width = "50px";
            pButton.style.height = "50px";
            pButton.innerHTML = '<img src="https://' + m_tenant + '/widgets/chat_button.png" width="50px" height="50px"></img>';
          }
    
          pButton.id = 'echo-chat-widget-panel-button';
          pButton.onclick = function() {
            overlay(false);
          };
          document.body.appendChild(pButton);
        } else {
          showPanelChat();
        }
      } else {
        if (document.getElementById('echo-chat-button') !== null) {
          document.getElementById('echo-chat-button').style.display = 'none';
        }
      }
    
    }
    
    function showPanelChat() {
      $('#echo-chat-main-container').css('display', 'block');
      $('#echo-chat-main-container').css('opacity', '1.0');
      $('#echo-chat-widget-panel-button').remove();
      $('.echo-chat-widget').css('display', 'block');
      $('body').addClass('noscroll-echo');
      autoScroll();
      // $('.echo-chat-widget').css('background-color', 'white');
    
      cButton = document.createElement('DIV');
      cButton.innerHTML = '<i class="fa fa-chevron-down" style="color: rgba(' + chat_data.font_color + ', .8); cursor: pointer;"></i>';
      cButton.className = 'chat-min-button';
      cButton.onclick = function() {
        overlay(true);
        cButton.remove();
      };
      $('.echo-chat-widget').append(cButton);
    }
    
    ////////////////////
    // Event Handlers //
    ////////////////////
    var hidden, visibilityChange;
    function fayeStatusUpdate(message){
      params = {
        message: message,
        visible: !document[hidden],
        visibilitySupport: hidden
      }
      $.ajax({
        url: full_url + '/full_frame_chats/' + window.chat_uuid + "/status_update",
        data: {data: params},
        type: "POST"
      });
      url = "/" + window.tenant_uuid + "/conversation_idle_status/" + window.chat_uuid
      // console.log("publishing to:", url);
      faye.publish(url, params);
    }
    
    function setupEventHandlers() {
      $(document).on('click', '.js-submit-new-chat', function() {
        submitNewChat();
      });
    
      // Check required fields, make sure they're all not empty
      $(document).on('keyup', '.js-chat-required-true', function() {
        var goodToSubmit = true;
    
        $('.js-chat-required-true').each(function() {
          if ($(this).val().trim() === '') {
            goodToSubmit = false;
          }
        });
    
        if (goodToSubmit){
          enableSubmit();
        }else{
          disableSubmit();
        }
      });
    
      $(document).on('click', '.js-privacy-policy-link', function(e) {
        e.preventDefault();
        var url = window.location.href.split('?') + '?show_privacy_policy=true';
        window.open(url);
      });
    
      $(document).on('click', '.js-index-link', function(e) {
        e.preventDefault();
        loadIndex();
      });
    
      $(window).on('blur', function() {
        isWindowFocused = false;
      });
    
      $(window).on('focus', function() {
        document.title = originalTitle;
    
        if(window.chat_uuid && !isWindowFocused) {
          isWindowFocused = true;
          updateReadMessages();
        }
      });
    
      typing_handler();
    
      $(document).on('keyup', '.js-chat-topic', function(e) {
        if (e.which !== '13') { return; }
        submitNewChat();
      });
    
      $(document).on('chat-timeout', function() {
        log("chat is timing out");
        missedSubmittable = true;
        timeoutChat();
      });
    
    
      $(document).on('click', '.js-submit-contact-info', function(){
        if (missedSubmittable) {
          console.log("client");
          missedSubmittable = false;
          submitNewContactInfo();
        }
      });
    
      $(document).on('submit', '.js-new-message-form', function(e) {
        e.preventDefault();
        var textarea = $(e.target).find('textarea');
        var content = textarea.val();
        textarea.val('');
        if(content && content.trim().length > 0){
          submitNewMessage(content);
        }
    
      });
    
      $(document).on('click', '.js-close-chat', function(e) {
        e.preventDefault();
        closeChat();
      });
    
      $(document).on('click', '#auto-scroll-btn', function(e) {
        e.preventDefault();
        autoScroll();
        var autoScrollButton = $('#auto-scroll-btn')
        autoScrollButton.hide();
        autoScrollButton.removeClass("echo-white")
        autoScrollButton.css("background-color", "rgb(10, 93, 108)");
        autoScrollButton.css("border", "solid 1px rgb(10, 93, 108)");
        autoScrollButton.children().first().children().first().attr("stroke", "white");
    
        notificationsRead();
      });
    
      $(document).on('keypress', '.js-enter-submit', function(e) {
        if (e.which !== 13) { return; }
        e.preventDefault();
        $(e.target).parent().submit();
      });
      setTimeout(function(){
        document.addEventListener('scroll', function (event) {
            if (event.target.id === 'echo-auto-scroll') { // or any other filtering condition
              var scrollable = $('.js-auto-scroll')
              var one = scrollable.height() + scrollable[0].scrollTop + 100
              var two = scrollable[0].scrollHeight
              var shouldAutoScroll =  one >=  two ;
              var autoScrollButton = $('#auto-scroll-btn')
              if(shouldAutoScroll){
                autoScrollButton.hide();
                autoScrollButton.removeClass("echo-white")
                autoScrollButton.css("background-color", "rgb(10, 93, 108)");
                autoScrollButton.css("border", "solid 1px rgb(10, 93, 108)");
                autoScrollButton.children().first().children().first().attr("stroke", "white");
    
    
                notificationsRead();
              } else {
                autoScrollButton.show();
              }
            }
        }, true /*Capture event*/);
      }, 1000)
    
    
      ///////////////////////
      // Faye Subscriptions//
      ///////////////////////
    
    
      $(document).on('faye-loaded', function() {
        var faye = window.faye;
        var channels = window.channels;
        faye.subscribe(channels.client_client_chat_new_message, function() {
          getLatestMessages();
        });
        autoScroll();
    
    
    
        // Set the name of the hidden property and the change event for visibility
    
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
          hidden = "hidden";
          visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
          hidden = "msHidden";
          visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
        }
    
        setInterval(function() {
          console.log('publishing...');
          fayeStatusUpdate("heartbeat");
        }, 15000);
        fayeStatusUpdate("heartbeat");
        // If the page is hidden, pause the video;
        // if the page is shown, play the video
        function handleVisibilityChange() {
          fayeStatusUpdate('');
        }
        window.onunload = function(){
          fayeStatusUpdate('Window closed or refreshed.')
        }
    
    
        // Warn if the browser doesn't support addEventListener or the Page Visibility API
        if (typeof document.addEventListener === "undefined" || typeof document.hidden === "undefined") {
          console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
        } else {
          // Handle page visibility change
          document.addEventListener(visibilityChange, handleVisibilityChange, false);
        }
    
        faye.subscribe(channels.client_client_chat_claimed, function() {
          chatHasBeenClaimed();
        });
    
        subscribe_to_agent_typing(faye, channels);
    
        faye.subscribe(channels.client_client_chat_closed, function() {
          closeChat();
        });
    
        $.ajax({
          url: full_url + '/full_frame_chats/' + window.chat_uuid + "/chat_client_initialized",
          data: {},
          type: "POST"
        });
      });
    
      $(document).on('faye-failed', function() {
        log('Faye failed to load');
      });
      //////////////
      // End Faye //
      //////////////
    
    }
    ////////////////////////
    // End Event Handlers //
    ////////////////////////
    
    function updateChatHTML(data) {
      $(".js-widget").html(data);
    
      overlay(false);
    }
    
    function updateChatList(data) {
      data = $.parseHTML(data);
      var scrollable = $('.js-auto-scroll');
      var shouldAutoScroll = scrollable.height() + scrollable[0].scrollTop + 20 >= scrollable[0].scrollHeight;
      var chatList = $("#js-chat-list")
      var children = chatList.children()
      var typingIndicator = $("#typing-indicator")
    
      for(var i = 0; i < data.length; i++) {
        var item = data[i];
        var found = false;
        children.each(function(idx){
          if(!item.dataset){
            return;
          }
          if($(this).data("message-id") == item.dataset.messageId){
            found = true;
          }
        })
        if(!found){
          if(typingIndicator.length > 0){
            $(item).insertBefore(typingIndicator);
          } else {
            chatList.append(item);
          }
    
          updateTypingIndicator(false);
        }
    
      }
      
      notificationButton = $('#echo-unread-messages')
    
      chatListLength = chatList.children().length;
      if (chatListLength >= 2 && chatList.children()[chatListLength-2].className.endsWith("from_agent"))
        notificationButton.text("" + ++unreadChatCount );
      if ($('#echo-chat-main-container').css('display') == 'none') {
        notificationButton.show()
      } else {
        notificationButton.hide()
      }
    
      if(shouldAutoScroll){
        autoScroll();
      } else {
        var autoScrollButton = $('#auto-scroll-btn')
        autoScrollButton.show();
        autoScrollButton.addClass("echo-white")
        autoScrollButton.css("background-color", "white");
        autoScrollButton.css("border", "solid 1px #3FB7CC");
        autoScrollButton.children().first().children().first().attr("stroke", "#3FB7CC");
    
      }
    
    }
    
    function updateMessageForm(data) {
      $('.js-new-message-form').replaceWith(data);
    }
    
    
    function submitNewChat() {
      if(submittingNewChat){
        return;
      }
      submittingNewChat = true;
      $.ajax({
        type: "POST",
        url: full_url + '/full_frame_chats',
        data: {
          chat: {
            topic: $('.js-chat-topic').val(),
            name: $('.js-chat-name').val(),
            email: $('.js-chat-email').val(),
            user_agent: navigator.userAgent,
            utm_campaign: findGetParameter('utm_campaign'),
            utm_source: findGetParameter('utm_source'),
            utm_medium: findGetParameter('utm_medium'),
            utm_content: findGetParameter('utm_content'),
            utm_term: findGetParameter('utm_term'),
            utm_outreach: findGetParameter('utm_outreach'),
            outreach: findGetParameter('outreach'),
            url: window.location.href,
          }
        },
        success: function(data, textStatus, request) {
          log("Submitting new chat");
          updateChatHTML(data);
          setCookie('client_session_token', window.client_token);
          clientToken = window.client_token;
          log("setting cookie: " + clientToken);
          setupAjax();
          startHeartbeats();
          submittingNewChat = false;
          $.ajax({
            url: full_url + '/full_frame_chats/' + window.chat_uuid + "/chat_client_initialized",
            data: {},
            type: "POST"
          });
        },
        error: function(data, textStatus, errorThrown) {
          submittingNewChat = false;
        }
      });
    }
    
    function timeoutChat() {
      clearInterval(window.waiting_heartbeat);
      $.ajax({
        type: "POST",
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/timeout',
        success: function(data) {
          log("Chat timed out");
          updateChatHTML(data);
        }
      });
    }
    
    function submitNewContactInfo () {
      $.ajax({
        type: "POST",
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/contact_info',
        data: {
          contact_info: {
            name: $('.js-contact-name').val(),
            email: $('.js-contact-email').val(),
            message: $('.js-contact-message').val()
          }
        },
        success: function(data) {
          log("Submitting new contact info");
          updateChatHTML(data);
        }
      });
    }
    
    function loadPrivacyPolicy() {
      $.ajax({
        type: 'GET',
        url: full_url + '/privacy_policy',
        success: function(data) {
          log("Loading privacy policy");
          updateChatHTML(data);
        }
      });
    }
    
    function loadIndex() {
      $.ajax({
        type: 'GET',
        url: full_url + '/full_frame_chats',
        success: function(data) {
          log("Loading index");
          updateChatHTML(data);
        }
      });
    }
    
    function chatHasBeenClaimed() {
      log("Chat has been claimed");
      clearInterval(window.timeoutInterval);
      window.noHeartbeats = true;
      $.ajax({
        type: "GET",
        url: full_url + '/full_frame_chats/' + window.chat_uuid,
        success: function(data) {
          $.ajax({
            type: "POST",
            url: full_url + '/full_frame_chats/' + window.chat_uuid + '/ack',
            success: function() {
            }
          });
    
          log("Retrieved claimed chat data");
          updateChatHTML(data);
    
          if ($('.chat-header').height() > 93) {
            $('.chat-widget-body').css('top', $('.chat-header').height()+'px !important');
          }
          startHeartbeats();
        }
      });
    }
    
    function submitNewMessage(content) {
      log("Submitting new message: " + content);
      stopTyping();
      autoScroll();
      $.ajax({
        type: "POST",
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/client_chat_messages',
        data: {
          chat_message: {
            content: content
          }
        }
      });
    }
    
    function getLatestMessages() {
      var lastMessageId = null;
      try {
        if ($('.js-chat-message') !== null && $('.js-chat-message') !== undefined) {
          var lastMessage = $('.js-chat-message').last();
          lastMessageId = lastMessage.data('message-id');
        }
      } catch(err) {
        console.log("Unable to stream messages with IE 9+");
      }
    
     $.ajax({
        type: "GET",
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/client_chat_messages.html',
        data: {
          last_id: lastMessageId
        },
        success: function(data) {
          log("Retrieved latest messages");
          if(lastMessageId >= latest_id || lastMessageId === undefined || lastMessageId === null){
            lastMessageId = latest_id;
            updateChatList(data);
          }
          else{
            // console.log('skipping', lastMessageId);
          }
    
        }
      });
    }
    
    function closeChat() {
      log("Closing Chat");
      window.chat_status = 'closed';
      
      $.ajax({
        type: 'POST',
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/close',
        success: function(data) {
          log("Retrieved closed chat data");
          updateMessageForm(data);
          clearInterval(window.offline_heartbeat);
    
          // if (chat_data.style_type == 'Overlay' || chat_data.style_type == 'Panel') {
          //   $('body').removeClass('noscroll-echo');
          //   $('.echo-chat-widget').css('display', 'none');
          // }
        }
      });
    }
    
    function updateReadMessages() {
      $.ajax({
        type: 'POST',
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/read_receipts'
      });
    }
    
    function isNameEmpty() {
      return $('.js-chat-name').val().trim() === '';
    }
    
    function disableSubmit() {
      $('.js-submit-new-chat').prop('disabled', true);
    }
    
    function enableSubmit() {
      $('.js-submit-new-chat').prop('disabled', false);
    }
    
    // Sets cookies
    function setCookie(name, value) {
      var CookieDate = new Date();
      CookieDate.setFullYear(CookieDate.getFullYear() + 10);
      document.cookie = name + "=" + value + "; expires=" + CookieDate.toGMTString() + ';';
    }
    
    ////////////////////////////
    // Agent/Client is Typing //
    ////////////////////////////
    
    var last_agent_typing_timestamp = 0;
    var typing = false;
    var ms_between_updates = 10000; // 10 seconds ago
    var last_typing = Date.now() - ms_between_updates
    var stopTypingCallback;
    
    
    function sendTypingEvent(isTyping) {
      typing = isTyping;
      if(typing){
        last_typing = Date.now()
      }
      $.ajax({
        type: 'POST',
        url: full_url + '/full_frame_chats/' + window.chat_uuid + '/typing',
        data: { typing: isTyping }
      });
    }
    
    
    function startTyping() {
        if(!typing){
          sendTypingEvent(true);
        } else if((Date.now() - ms_between_updates) > last_typing){
          sendTypingEvent(true);
        }
        clearTimeout(stopTypingCallback);
        stopTypingCallback = setTimeout(function() {
          sendTypingEvent(false);
        }, 15000);
    }
    
    
    function stopTyping() {
      clearTimeout(stopTypingCallback);
      sendTypingEvent(false);
    }
    
    
    function updateTypingIndicator(isTyping) {
      if (isTyping) {
        $('.typing-indicator').removeClass('hidden');
        $('.chat-widget-body').addClass('typing');
      } else {
        $('.typing-indicator').addClass('hidden');
        $('.chat-widget-body').removeClass('typing');
      }
    }
    
    var agentTypingCallback;
    function subscribe_to_agent_typing(faye, channels){
      faye.subscribe(channels.client_client_chat_agent_typing, function(data) {
        if(data.client_typing){ return; }
        if (last_agent_typing_timestamp < data.timestamp){
          var indicator = $('#typing-indicator-name')[0];
          if(indicator){
            indicator.innerHTML = data.name;
          }
    
          $('#user_name')[0].innerHTML = data.name;
          updateTypingIndicator(data.agent_typing);
          last_agent_typing_timestamp = data.timestamp;
    
          clearTimeout(agentTypingCallback);
          agentTypingCallback = setTimeout(function() {
            updateTypingIndicator(false);
          }, 20000);
        }
      });
    }
    
    
    function typing_handler(){
      $(document).on('keyup', '.js-new-message-content', function(e) {
        if (e.which !== '13' && e.which !== 13) {
          startTyping();
        }
      });
    }
    
    ////////////////////////////////
    // End Agent/Client is Typing //
    ////////////////////////////////
    
    function autoScroll() {
      var scrollable = $('.js-auto-scroll');
      if(scrollable && scrollable[0]){
        scrollable.animate({scrollTop: scrollable[0].scrollHeight}, "fast");
      }
    }
    
    // Reads cookies
    function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) === 0) {
          return c.substring(name.length,c.length);
        }
      }
      return "";
    }
    
    function log(message) {
    }
    
    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    }
    
    window.onbeforeunload = function() {
      fayeStatusUpdate("Window closed or refreshed")
    };
    
    })();