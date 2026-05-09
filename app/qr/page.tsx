"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QrPage() {
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const target = useMemo(
    () => (origin ? `${origin}/participant-form` : null),
    [origin]
  );

  return (
    <main className="shell">
      <section className="qr-shell">
        <header className="form-header">
          <p className="eyebrow">Scan to submit</p>
          <h1>Add your team to the bracket.</h1>
          <p className="muted">
            Point your camera at the code. The form takes about a minute.
          </p>
        </header>

        <div className="qr-card">
          {target ? (
            <>
              <QRCodeSVG
                value={target}
                size={360}
                level="M"
                marginSize={2}
                bgColor="#fffdf8"
                fgColor="#171717"
              />
              <code className="qr-url">{target}</code>
            </>
          ) : (
            <div className="qr-placeholder" />
          )}
        </div>
      </section>
    </main>
  );
}
