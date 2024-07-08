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
      <h1>test</h1>
      <Helmet>
        <script
          src="https://miracle.echoglobal.org/client/websites/full_frame_widget.js?v=6"
          type="text/javascript"
        ></script>
      </Helmet>
    </>
  );
};

export { ChatWrapper };
