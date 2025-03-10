import { generateQRCodeURL } from "@/lib/utils";

interface QRCodeProps {
  text: string;
  size?: number;
  className?: string;
  alt?: string;
}

export default function QRCode({ text, size = 200, className = "", alt = "QR Code" }: QRCodeProps) {
  const qrCodeUrl = generateQRCodeURL(text, size);
  
  return (
    <img 
      src={qrCodeUrl} 
      alt={alt} 
      className={className} 
      width={size} 
      height={size}
    />
  );
}
