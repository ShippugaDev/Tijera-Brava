import Link from "next/link";

const LOGO_URL =
  "https://kcdsmhcybkqkgsncjoyr.supabase.co/storage/v1/object/public/logos/tijera-brava-logo-navbar.png";

type BrandLogoProps = {
  href?: string;
  className?: string;
  imgClassName?: string;
};

export function BrandLogo({
  href = "/",
  className = "",
  imgClassName = "h-12 w-auto object-contain"
}: BrandLogoProps) {
  return (
    <Link className={`flex items-center ${className}`} href={href}>
      <img alt="Logo Tijera Brava" className={imgClassName} src={LOGO_URL} />
    </Link>
  );
}
