/* eslint-disable @typescript-eslint/no-unused-vars */
import { useIntl } from "react-intl";
import { Helmet } from "react-helmet";
import { useEffect } from "react";
import bgChat from "../../modules/chat/chat-bg.png"
import connected from "../../modules/chat/connected.png"
declare global {
	interface Window {
		echo_tenant: string;
		echo_uuid: string;
	}
}

const ChatWrapper = () => {
	const intl = useIntl();

	useEffect(() => {
		window.echo_tenant = "miracle.echoglobal.org";
		window.echo_uuid = "abebb8ca-bad4-4051-b890-bcc147b60ac5";
	}, []);

  useEffect(() => {
    // JavaScript code to remove "ب" from "الحوار متصل ب"
    const echoTitleElement = document.querySelector('h1.echo-title.echo-connected-with');
    if (echoTitleElement) {
      echoTitleElement.innerHTML = echoTitleElement.innerHTML.replace(" ب", "");
    }
  }, []);

	return (
		<>
			<div className="js-widget echo-chat-widget"></div>
			<div className="d-flex justify-content-center align-items-center h-100">
				<div className="loader"></div>
			</div>
			<Helmet>
				<script
					src="https://miracle.echoglobal.org/client/websites/full_frame_widget.js?v=6"
					type="text/javascript"
				></script>
			</Helmet>

			<style type="text/css">
				{`

        .echo-connected-with span {
        display:none !important;
        }
				.echo-chat-widget .chat-widget-body .chat-list {
  gap: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
      overflow: hidden !important;

}

.echo-chat-widget .chat-widget-body .chat-list li:first-child {
  width: 100% !important;
  padding: 0px 20px 15px 20px !important;
  background: white !important;
  border-radius: 0px 0px 68px 68px;
}

.echo-chat-widget .chat-widget-body .chat-list li:not(:first-child) {
  width: 50% !important;
  margin: 0px 10px !important;
}

#echo-bg-color {
  background-image: url(${bgChat}) !important;
  // background: rgba(0,0,0,0.3) !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

#echo-bg-color {
  position: relative;
  width: 100%;
  height: 100vh; /* Adjust as needed */
}

#echo-bg-color .background-image {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-image: url(${bgChat}) !important !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  z-index: -1 !important;
}

#echo-bg-color .background-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-color: rgba(
    255,
    255,
    255,
    0.8
  ) !important; /* White overlay with 80% opacity */
  z-index: -1 !important;
}

.from_client {
  background: #34a960 !important;
  color: white !important;
  right: 0px !important;
  padding: 6px 12px 6px 12px !important;
  border-radius: 18px 18px 2px 18px !important;
  align-self: flex-start !important;
  text-align: left !important;
}

.from_agent {
  background: #fff !important;
  color: black !important;
  left: 0px !important;
  padding: 6px 12px 6px 12px !important;
  border-radius: 18px 18px 18px 2px !important;
  align-self: flex-end !important;
  text-align: right !important;
}

.from_agent .message-name span {
  color: black !important;
  font-size: 14px !important;
}

.js-widget.echo-chat-widget .message .message-content {
  color: black !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  line-height: 22px !important;
  letter-spacing: -0.02149796113371849px !important;
}

.echo-title {
  font-size: 28.44px !important;
  font-weight: 700 !important;
  line-height: 31.74px !important;
  text-align: start !important;
  color: #000000 !important;
}

.js-widget.echo-chat-widget h1 {
  color: #000000 !important;
  font-size: 28.44px !important;
  font-weight: 700 !important;
  line-height: 31.74px !important;
  text-align: start !important;
  color: #000000 !important;
  white-space: normal !important;
}

#js-chat-list {
  list-style-type: none !important;
  padding: 0 !important;
  padding-bottom: 40px !important;
}

.js-chat-message {
  display: flex !important;
  flex-direction: column !important;
  padding: 10px !important;
  margin-bottom: 10px !important;
  max-width: 70% !important;
  align-items: flex-start !important;
}

.message-name {
  font-weight: bold !important;
}

.message-content {
  margin-top: 5px !important;
}

.echo-chat-widget .new-message-content {
  width: 300px !important;
  height: 100% !important;
  gap: 0px !important;
  border-radius: 20px !important;
  border: 1px solid #f1f1f1 !important;
  background: #ffffff;
}

.echo-chat-widget .new-message-form {
  color: white !important;
  margin-left: 10px !important;
  margin-right: 10px !important;
}

.echo-chat-widget .echo-chat-header {
  width: 100% !important;
}

.echo-chat-widget .echo-chat-body {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  align-content: center !important;
  justify-content: center !important;
}

.echo-chat-widget .chat-form {
  margin-bottom: 0px !important;
  background: transparent !important;
}

.js-widget.echo-chat-widget .new-message-content {
  color: #000000 !important;
  background: white !important;
}

.js-widget.echo-chat-widget .echo-button.button-text {
  color: #ed1c24 !important;
  font-weight: 600 !important;
  width: 15% !important;
  position: static !important;
  font-size: clamp(1rem, 0.8214rem + 0.8929vw, 1.25rem) !important;
}

.echo-chat-widget .message {
  padding: 10px !important;
}

.js-widget.echo-chat-widget .from_client .message .message-content {
  color: white !important;
}

.js-close-chat .close-button i {
  color: black !important;
}

.echo-chat-widget textarea::placeholder {
  color: black !important;
}

.js-widget.echo-chat-widget .echo-disconnected-center {
  color: #ed1c24 !important;
}

.js-widget.echo-chat-widget .new-message-content {
  width: 85% !important;
}

.echo-chat-widget .chat-widget-body {
  margin: 0 !important;
  padding: 0 0px !important;
  width: 100% !important;
}

.echo-chat-widget .new-message-form {
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
}

.js-widget.echo-chat-widget .message.from_client .message-content {
  color: white !important;
}

.from_client .message-name span {
  font-size: 14px !important;
}

.echo-chat-header h1:first-child {
  padding-bottom: 10px !important;
  margin-bottom: 20px !important;
  // border-bottom: 1px solid #ccc;
  display: none !important;
}

.chat-banner[dir="rtl"] {
  float: center !important;
}

.auto-scroller {
  top: -45px;
  background: #ed1c24 !important;
  border: 1px solid #ed1c24 !important;
}

.auto-scroller svg {
  color: white !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-35%, -50%) !important;
  padding: 0px !important;
  margin: 0px !important;
}

.chat-banner[dir="rtl"] {
  float: center !important;
}

// .echo-chat-widget .echo-chat-header .echo-title {
//   white-space: normal !important; 
//   width: 100% !important;
//   max-width: 480px !important;
// }

.echo-chat-widget .echo-chat-header .echo-title,
.echo-chat-widget .echo-chat-header .echo-title.echo-connected-with {
    white-space: normal !important;
    width: 100% !important;
    max-width: 480px !important;
}
    .echo-chat-widget .echo-chat-header .echo-title.echo-connected-with{
    display: inline !important;
    }

    .echo-chat-widget .echo-chat-header .echo-title{
        white-space: normal !important;
}

    .echo-chat-widget .echo-chat-header  .echo-title.echo-connected-with:nth-child(2)::before {
        content: url('${connected}'); 
        display: inline-block;
        margin-right: 10px; /* Adjust spacing as needed */
        vertical-align: middle;
}

.echo-chat-widget .message .message-name{
display: none !important;}

`}
			</style>
      <script type="text/javascript">
      {`
document.addEventListener("DOMContentLoaded", function() {
    var echoTitleElement = document.querySelector('h1.echo-title');
    if (echoTitleElement) {
        echoTitleElement.removeAttribute('style');
    }
});
`}
      </script>

      <script type="text/javascript">
      {`  const echoTitleElement = document.querySelector('h1.echo-title.echo-connected-with');
    if (echoTitleElement) {
      echoTitleElement.innerHTML = echoTitleElement.innerHTML.replace(" ب", "");
    }`}</script>
		</>
	);
};

export { ChatWrapper };
