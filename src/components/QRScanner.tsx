// @ts-ignore: Missing type declarations for 'react-qr-reader'
import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  fps?: number;
  qrbox?: number;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, fps = 10, qrbox = 250 }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!qrRef.current) return;
    const html5QrCode = new Html5Qrcode(qrRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      { fps, qrbox },
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        if (onError) onError(errorMessage);
      }
    );

    return () => {
      html5QrCode.stop().catch(() => {});
      html5QrCode.clear();
    };
  }, [onScan, onError, fps, qrbox]);

  return (
    <div>
      <div id="qr-scanner" ref={qrRef} style={{ width: qrbox, height: qrbox }} />
    </div>
  );
};

export default QRScanner;
