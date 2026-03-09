import { memo, useEffect, useRef } from 'react';

const MODULE_SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/vi_VN/tv-ticker-tape.js';
const SYMBOLS = 'BITSTAMP:BTCUSD,CMCMARKETS:GOLD,TVC:USOIL,FX_IDC:USDVND';

function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existing = document.querySelector(`script[src="${MODULE_SCRIPT_URL}"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = MODULE_SCRIPT_URL;
      document.body.appendChild(script);
    }

    const widget = document.createElement('tv-ticker-tape');
    widget.setAttribute('symbols', SYMBOLS);
    widget.setAttribute('show-hover', '');
    containerRef.current.appendChild(widget);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} />;
}

export default memo(TickerTape);
