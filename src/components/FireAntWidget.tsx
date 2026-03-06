import { memo, useEffect, useRef } from 'react';

declare global {
  interface Window {
    FireAnt?: {
      MarketsWidget: new (config: Record<string, string>) => void;
    };
  }
}

const FIREANT_SCRIPT_URL = 'https://www.fireant.vn/Scripts/web/widgets.js';
const CONTAINER_ID = 'fan-quote-963';

function FireAntWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = () => {
      if (window.FireAnt) {
        new window.FireAnt.MarketsWidget({
          container_id: CONTAINER_ID,
          locale: 'vi',
          price_line_color: '#71BDDF',
          grid_color: '#999999',
          label_color: '#999999',
          width: '100%',
          height: '250px',
        });
      }
    };

    if (window.FireAnt) {
      init();
      return;
    }

    const existing = document.querySelector(`script[src="${FIREANT_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', init);
      return;
    }

    const script = document.createElement('script');
    script.src = FIREANT_SCRIPT_URL;
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 flex items-center border-l-4 border-primary pl-3">
        Chỉ số thị trường
      </h3>
      <div id={CONTAINER_ID} ref={containerRef} />
    </div>
  );
}

export default memo(FireAntWidget);
