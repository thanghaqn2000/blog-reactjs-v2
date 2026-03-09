import { memo, useEffect, useRef } from 'react';

const WIDGET_SCRIPT_URL = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
const WIDGET_HEIGHT = 550;

function EconomicCalendar() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    if (container.current.querySelector(`script[src="${WIDGET_SCRIPT_URL}"]`)) return;

    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      isTransparent: false,
      locale: 'vi_VN',
      countryFilter: 'ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu',
      importanceFilter: '-1,0,1',
      width: '100%',
      height: WIDGET_HEIGHT,
    });
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 flex items-center border-l-4 border-primary pl-3">
        Sự kiện kinh tế
      </h3>
      <div className="tradingview-widget-container" ref={container} style={{ height: WIDGET_HEIGHT }}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}

export default memo(EconomicCalendar);
