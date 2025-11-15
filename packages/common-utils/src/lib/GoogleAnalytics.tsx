"use client";

interface GoogleAnalyticsProps {
  trackingId: string;
}


const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_path: window.location.pathname,
              custom_map: {
                custom_parameter_1: 'subscription_flow_step'
              }
            });
          `,
        }}
      />
    </>
  );
};



export default GoogleAnalytics;
