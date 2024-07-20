/* eslint-disable @typescript-eslint/no-unused-vars */
import { useIntl } from "react-intl";
import { Helmet } from "react-helmet";
import { useEffect } from "react";
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
						.echo-chat-widget .chat-widget-body .chat-list {
    gap: 12px;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .echo-chat-widget .chat-widget-body .chat-list li:first-child {
    width: 100% !important;
  }
  
  .echo-chat-widget .chat-widget-body .chat-list li:not(:first-child) {
    width: 50% !important;
  }
  
  #echo-bg-color {
    background: #f8f8f8 !important;
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
  }
  
  .js-widget.echo-chat-widget .message .message-content {
    color: black !important;
font-size: 14px !important;
font-weight: 400 !important;
line-height: 16px !important;
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
  }
  
  #js-chat-list {
    list-style-type: none !important;
    padding: 0 !important;
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
  

  .echo-chat-widget .new-message-content{
    width: 300px !important;
height: 100% !important;
gap: 0px !important;
border-radius: 20px !important;
border: 1px solid #000 !important;
background: #FFFFFF;
  }

  .echo-chat-widget .new-message-form{
    color: transparent !important;
  }

  .echo-chat-widget .echo-chat-header{
    width: 100% !important;
  }

  .echo-chat-widget .echo-chat-body {
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    align-content: center !important;
}

.echo-chat-widget .chat-form {
margin-bottom :35px !important;
background: transparent !important;
}

.js-widget.echo-chat-widget .new-message-content{
    color:#000000 !important;
}

.js-widget.echo-chat-widget .echo-button.button-text {
    color:  #ED1C24 !important;
}

.echo-chat-widget .message{
    padding:10px !important;
}


.js-widget.echo-chat-widget .from_client .message .message-content
 {
    color: white !important;
  }

  .js-close-chat .close-button i {
  color:black !important;}

  .echo-chat-widget textarea::placeholder{
    color:black !important;
}

.js-widget.echo-chat-widget .echo-disconnected-center{

    color:  #ED1C24 !important;

}
					`}
				</style>
			{/* <script type="text/javascript" src="chat.js"></script> */}


			{/* <link rel="stylesheet" href="chat.css" /> */}
		</>
	);
};

export { ChatWrapper };
