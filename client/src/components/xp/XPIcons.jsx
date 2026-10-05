import React from 'react';

/**
 * Windows XP Classic Style SVG Icons
 * Recreates the retro 16x16 and 32x32 pixel/vector look of classic Windows XP desktop icons.
 */

// Classic XP Yellow Folder
export function XPFolderIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 3C1 2.44772 1.44772 2 2 2H6L8 4H14C14.5523 4 15 4.44772 15 5V13C15 13.5523 14.5523 14 14 14H2C1.44772 14 1 13.5523 1 13V3Z" fill="#D79C1F" stroke="#875E00" strokeWidth="0.8"/>
      <path d="M1.5 5H14.5V13C14.5 13.2761 14.2761 13.5 14 13.5H2C1.72386 13.5 1.5 13.2761 1.5 13V5Z" fill="#FFD15C"/>
      <path d="M2 6H14V13H2V6Z" fill="#FFE599"/>
      <path d="M1.5 5.5L4 13H14.5L14.5 5.5H1.5Z" fill="url(#xp_folder_grad)"/>
      <defs>
        <linearGradient id="xp_folder_grad" x1="8" y1="5.5" x2="8" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE082"/>
          <stop offset="1" stopColor="#FFCA28"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Classic XP Document File
export function XPDocumentIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 1.5C3 1.22386 3.22386 1 3.5 1H10.5L14 4.5V14.5C14 14.7761 13.7761 15 13.5 15H3.5C3.22386 15 3 14.7761 3 14.5V1.5Z" fill="#FFFFFF" stroke="#716F64" strokeWidth="0.8"/>
      <path d="M10 1V4.5H13.5L10 1Z" fill="#D4D0C8" stroke="#716F64" strokeWidth="0.8"/>
      {/* Document text lines */}
      <line x1="5" y1="6" x2="11" y2="6" stroke="#428EFF" strokeWidth="1"/>
      <line x1="5" y1="8.5" x2="12" y2="8.5" stroke="#716F64" strokeWidth="1"/>
      <line x1="5" y1="11" x2="10" y2="11" stroke="#716F64" strokeWidth="1"/>
    </svg>
  );
}

// Classic XP PDF Document
export function XPPdfIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 1.5C3 1.22386 3.22386 1 3.5 1H10.5L14 4.5V14.5C14 14.7761 13.7761 15 13.5 15H3.5C3.22386 15 3 14.7761 3 14.5V1.5Z" fill="#FFFFFF" stroke="#B82B13" strokeWidth="0.8"/>
      <path d="M10 1V4.5H13.5L10 1Z" fill="#FFCDD2" stroke="#B82B13" strokeWidth="0.8"/>
      <rect x="4" y="6" width="8" height="6.5" rx="1" fill="#E53935"/>
      <text x="5" y="11" fill="white" fontSize="5" fontWeight="bold" fontFamily="Tahoma">PDF</text>
    </svg>
  );
}

// Classic XP Image / Picture
export function XPImageIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="2" width="13" height="12" rx="1" fill="#FFFFFF" stroke="#3A6EA5" strokeWidth="0.8"/>
      <rect x="2.5" y="3" width="11" height="10" fill="#64B5F6"/>
      {/* Sun and mountain */}
      <circle cx="10.5" cy="5.5" r="1.5" fill="#FFF176"/>
      <polygon points="3,12 7,6 10,10 12,8 13.5,12" fill="#81C784"/>
      <polygon points="3,13 13.5,13 13.5,11 3,11" fill="#388E3C"/>
    </svg>
  );
}

// Classic XP Code File
export function XPCodeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 1.5C3 1.22386 3.22386 1 3.5 1H10.5L14 4.5V14.5C14 14.7761 13.7761 15 13.5 15H3.5C3.22386 15 3 14.7761 3 14.5V1.5Z" fill="#F0F4F8" stroke="#1565C0" strokeWidth="0.8"/>
      <path d="M10 1V4.5H13.5L10 1Z" fill="#BBDEFB" stroke="#1565C0" strokeWidth="0.8"/>
      <text x="4.5" y="10.5" fill="#0D47A1" fontSize="6" fontWeight="bold" fontFamily="Courier New">&lt;/&gt;</text>
    </svg>
  );
}

// Classic XP Archive / Zip File
export function XPArchiveIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 1.5C3 1.22386 3.22386 1 3.5 1H10.5L14 4.5V14.5C14 14.7761 13.7761 15 13.5 15H3.5C3.22386 15 3 14.7761 3 14.5V1.5Z" fill="#FFF8E1" stroke="#F57F17" strokeWidth="0.8"/>
      <path d="M10 1V4.5H13.5L10 1Z" fill="#FFE082" stroke="#F57F17" strokeWidth="0.8"/>
      {/* Zipper */}
      <rect x="7.5" y="4" width="1.5" height="1.5" fill="#37474F"/>
      <rect x="6.5" y="6" width="1.5" height="1.5" fill="#37474F"/>
      <rect x="7.5" y="8" width="1.5" height="1.5" fill="#37474F"/>
      <rect x="6.5" y="10" width="1.5" height="1.5" fill="#37474F"/>
      <rect x="6.5" y="12" width="3" height="2" fill="#FDD835" stroke="#F57F17" strokeWidth="0.5"/>
    </svg>
  );
}

// Classic XP Computer / Workstation
export function XPComputerIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="9" rx="1" fill="#ECE9D8" stroke="#716F64" strokeWidth="0.8"/>
      <rect x="3.5" y="3.5" width="9" height="6" fill="#1565C0"/>
      <rect x="6.5" y="11" width="3" height="2" fill="#D4D0C8" stroke="#716F64" strokeWidth="0.5"/>
      <rect x="4" y="13" width="8" height="1.5" rx="0.5" fill="#ECE9D8" stroke="#716F64" strokeWidth="0.8"/>
    </svg>
  );
}

// Classic XP Hard Drive
export function XPHardDriveIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="4.5" width="13" height="7" rx="1" fill="#ECE9D8" stroke="#555555" strokeWidth="0.8"/>
      <line x1="2" y1="9" x2="14" y2="9" stroke="#AAAAAA" strokeWidth="0.5"/>
      <circle cx="12" cy="7" r="0.8" fill="#4CAF50"/>
      <rect x="3" y="6" width="6" height="2" rx="0.5" fill="#B0BEC5"/>
    </svg>
  );
}

// Classic XP Security Shield
export function XPShieldIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1L2 3.5V7.5C2 11.5 8 15 8 15C8 15 14 11.5 14 7.5V3.5L8 1Z" fill="url(#xp_shield_grad)" stroke="#1565C0" strokeWidth="0.8"/>
      <path d="M8 2.5L3.5 4.5V7.5C3.5 10.8 8 13.5 8 13.5C8 13.5 12.5 10.8 12.5 7.5V4.5L8 2.5Z" fill="#42A5F5"/>
      <path d="M8 2.5V13.5C8 13.5 12.5 10.8 12.5 7.5V4.5L8 2.5Z" fill="#1E88E5"/>
      <defs>
        <linearGradient id="xp_shield_grad" x1="8" y1="1" x2="8" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#90CAF9"/>
          <stop offset="1" stopColor="#1565C0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Classic XP Key / Recovery
export function XPKeyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="6" r="3.5" fill="#FFD54F" stroke="#F57F17" strokeWidth="0.8"/>
      <circle cx="5.5" cy="6" r="1.5" fill="#ECE9D8" stroke="#F57F17" strokeWidth="0.5"/>
      <path d="M8.5 7.5L14 13L12.5 14.5L10.5 12.5L9.5 13.5L7.5 11.5L8.5 10.5" stroke="#F57F17" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// Classic XP Info / Help Icon
export function XPInfoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="#1E88E5" stroke="#0D47A1" strokeWidth="0.8"/>
      <text x="6.5" y="11.5" fill="white" fontSize="9" fontWeight="bold" fontFamily="Tahoma">i</text>
    </svg>
  );
}

// Classic XP Warning Icon
export function XPWarningIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,1 15,14 1,14" fill="#FDD835" stroke="#F57F17" strokeWidth="0.8"/>
      <line x1="8" y1="5" x2="8" y2="10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="12" r="0.8" fill="#000000"/>
    </svg>
  );
}
