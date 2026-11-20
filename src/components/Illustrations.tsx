import React from 'react';
import { ColorItem, EmotionItem, NumberItem, ShapeItem } from '../types/rafiq';

export const RafiqLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const iconDim = size === 'lg' ? 68 : size === 'sm' ? 36 : 48;
  const textClass =
    size === 'lg' ? 'text-4xl font-extrabold' : size === 'sm' ? 'text-xl font-bold' : 'text-2xl font-extrabold';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="20" fill="#4A90E2" />
        <circle cx="24" cy="24" r="9" fill="#FFC107" />
        <path
          d="M16 44C16 37.3726 21.3726 32 28 32H36C42.6274 32 48 37.3726 48 44V46C48 48.2091 46.2091 50 44 50H20C17.7909 50 16 48.2091 16 46V44Z"
          fill="#FFFFFF"
        />
        <circle cx="43" cy="22" r="6" fill="#4CAF50" stroke="#FFFFFF" strokeWidth="2.5" />
      </svg>
      <span className={`${textClass} text-[#1E293B] tracking-tight`}>رفيق</span>
    </div>
  );
};

export const ChildrenLearningIllustration: React.FC = () => {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[380px] h-auto mx-auto"
      role="img"
      aria-label="رسم توضيحي هادئ لأطفال يتعلمون الألوان والأشكال والأرقام"
    >
      {/* Soft sky backdrop */}
      <rect x="20" y="16" width="380" height="224" rx="32" fill="#EFF6FF" />
      <circle cx="338" cy="64" r="24" fill="#FFC107" fillOpacity="0.9" />
      <circle cx="338" cy="64" r="34" stroke="#FFC107" strokeOpacity="0.25" strokeWidth="6" />

      {/* Soft clouds */}
      <rect x="52" y="44" width="76" height="24" rx="12" fill="#FFFFFF" />
      <circle cx="76" cy="44" r="14" fill="#FFFFFF" />
      <circle cx="102" cy="48" r="11" fill="#FFFFFF" />

      {/* Floating gentle educational shapes */}
      <circle cx="164" cy="64" r="14" fill="#4CAF50" fillOpacity="0.2" stroke="#4CAF50" strokeWidth="3" />
      <path d="M242 46L258 74H226L242 46Z" fill="#4A90E2" fillOpacity="0.2" stroke="#4A90E2" strokeWidth="3" strokeLinejoin="round" />

      {/* Study table */}
      <rect x="58" y="176" width="304" height="18" rx="9" fill="#CBD5E1" />
      <rect x="86" y="194" width="16" height="46" rx="8" fill="#94A3B8" />
      <rect x="318" y="194" width="16" height="46" rx="8" fill="#94A3B8" />

      {/* Child 1 (Right in RTL) */}
      <circle cx="272" cy="112" r="28" fill="#FDE6D8" />
      <path d="M244 108C244 91 256 80 272 80C288 80 300 91 300 108C294 100 284 96 272 96C260 96 250 100 244 108Z" fill="#334155" />
      <circle cx="262" cy="112" r="3" fill="#1E293B" />
      <circle cx="282" cy="112" r="3" fill="#1E293B" />
      <path d="M265 123C268 127 276 127 279 123" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M238 176C238 153 253 140 272 140C291 140 306 153 306 176H238Z" fill="#4A90E2" />

      {/* Child 2 (Left in RTL) */}
      <circle cx="148" cy="116" r="26" fill="#F9DEC9" />
      <path d="M122 114C122 95 134 84 148 84C162 84 174 95 174 114C168 104 160 99 148 99C136 99 128 104 122 114Z" fill="#475569" />
      <circle cx="139" cy="116" r="3" fill="#1E293B" />
      <circle cx="157" cy="116" r="3" fill="#1E293B" />
      <path d="M142 126C145 129.5 151 129.5 154 126" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M116 176C116 155 130 142 148 142C166 142 180 155 180 176H116Z" fill="#4CAF50" />

      {/* Open book & wooden blocks on table */}
      <rect x="184" y="158" width="52" height="18" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <line x1="210" y1="158" x2="210" y2="176" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="294" y="150" width="24" height="26" rx="6" fill="#FFC107" />
      <rect x="102" y="154" width="22" height="22" rx="6" fill="#E5534B" fillOpacity="0.85" />
    </svg>
  );
};

export const ColorIllustration: React.FC<{ colorId: ColorItem['id']; size?: 'sm' | 'lg' }> = ({
  colorId,
  size = 'lg',
}) => {
  const dim = size === 'lg' ? 112 : 76;

  if (colorId === 'red') {
    return (
      <svg width={dim} height={dim} viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle cx="56" cy="56" r="52" fill="#FEE2E2" />
        {/* Apple */}
        <path
          d="M56 36C45 36 33 44 33 60C33 76 44 88 53 88C55 88 56 86 56 86C56 86 57 88 59 88C68 88 79 76 79 60C79 44 67 36 56 36Z"
          fill="#E5534B"
        />
        <path d="M56 36C56 29 59 24 64 21" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
        <path d="M58 28C65 25 71 27 72 32C66 34 61 33 58 28Z" fill="#4CAF50" />
        <ellipse cx="45" cy="52" rx="4" ry="8" transform="rotate(-15 45 52)" fill="#FFFFFF" fillOpacity="0.35" />
      </svg>
    );
  }

  if (colorId === 'green') {
    return (
      <svg width={dim} height={dim} viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle cx="56" cy="56" r="52" fill="#DCFCE7" />
        {/* Tree */}
        <rect x="50" y="66" width="12" height="24" rx="4" fill="#92400E" />
        <circle cx="56" cy="48" r="24" fill="#4CAF50" />
        <circle cx="42" cy="56" r="14" fill="#4CAF50" />
        <circle cx="70" cy="56" r="14" fill="#4CAF50" />
        <circle cx="49" cy="40" r="6" fill="#86EFAC" fillOpacity="0.6" />
      </svg>
    );
  }

  if (colorId === 'blue') {
    return (
      <svg width={dim} height={dim} viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle cx="56" cy="56" r="52" fill="#DBEAFE" />
        {/* Friendly Blue Whale */}
        <path
          d="M28 60C28 45 41 36 56 36C72 36 82 46 82 59C82 70 72 78 55 78C40 78 28 71 28 60Z"
          fill="#4A90E2"
        />
        <path d="M80 60C88 58 92 52 91 48C86 49 82 53 80 57" fill="#4A90E2" />
        <path d="M80 61C88 63 92 69 91 73C86 72 82 68 80 64" fill="#4A90E2" />
        <path d="M34 65C41 72 52 74 64 73" stroke="#DBEAFE" strokeWidth="4" strokeLinecap="round" />
        <circle cx="42" cy="54" r="3.5" fill="#FFFFFF" />
        <circle cx="42" cy="54" r="1.8" fill="#1E293B" />
        {/* Water drop */}
        <path d="M56 20C56 20 51 27 51 30C51 32.8 53.2 35 56 35C58.8 35 61 32.8 61 30C61 27 56 20 56 20Z" fill="#60A5FA" />
      </svg>
    );
  }

  return (
    <svg width={dim} height={dim} viewBox="0 0 112 112" fill="none" aria-hidden="true">
      <circle cx="56" cy="56" r="52" fill="#FEF9C3" />
      {/* Warm Sun */}
      <circle cx="56" cy="56" r="22" fill="#F5B800" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="56"
          y1="22"
          x2="56"
          y2="29"
          stroke="#F5B800"
          strokeWidth="4.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 56 56)`}
        />
      ))}
      <circle cx="49" cy="53" r="2.5" fill="#713F12" />
      <circle cx="63" cy="53" r="2.5" fill="#713F12" />
      <path d="M50 61C53 64 59 64 62 61" stroke="#713F12" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export const ShapeIllustration: React.FC<{
  shapeId: ShapeItem['id'];
  size?: number;
  withExample?: boolean;
}> = ({ shapeId, size = 104, withExample = false }) => {
  if (shapeId === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 104 104" fill="none" aria-hidden="true">
        <circle cx="52" cy="52" r="38" fill="#4A90E2" fillOpacity="0.16" stroke="#4A90E2" strokeWidth="6" />
        {withExample && (
          <>
            <circle cx="52" cy="52" r="14" fill="#FFFFFF" stroke="#4A90E2" strokeWidth="3" />
            <line x1="52" y1="52" x2="52" y2="43" stroke="#4A90E2" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="52" y1="52" x2="59" y2="52" stroke="#4A90E2" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    );
  }

  if (shapeId === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 104 104" fill="none" aria-hidden="true">
        <rect
          x="16"
          y="16"
          width="72"
          height="72"
          rx="10"
          fill="#4CAF50"
          fillOpacity="0.16"
          stroke="#4CAF50"
          strokeWidth="6"
        />
        {withExample && (
          <>
            <line x1="52" y1="18" x2="52" y2="86" stroke="#4CAF50" strokeWidth="3" />
            <line x1="18" y1="52" x2="86" y2="52" stroke="#4CAF50" strokeWidth="3" />
          </>
        )}
      </svg>
    );
  }

  if (shapeId === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 104 104" fill="none" aria-hidden="true">
        <path
          d="M52 16L88 84H16L52 16Z"
          fill="#F59E0B"
          fillOpacity="0.18"
          stroke="#F59E0B"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {withExample && (
          <path d="M52 58L63 84H41L52 58Z" fill="#F59E0B" fillOpacity="0.45" />
        )}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 104 104" fill="none" aria-hidden="true">
      <rect
        x="10"
        y="26"
        width="84"
        height="52"
        rx="10"
        fill="#7C69EF"
        fillOpacity="0.16"
        stroke="#7C69EF"
        strokeWidth="6"
      />
      {withExample && (
        <>
          <line x1="52" y1="28" x2="52" y2="76" stroke="#7C69EF" strokeWidth="3" />
          <line x1="24" y1="44" x2="42" y2="44" stroke="#7C69EF" strokeWidth="3" strokeLinecap="round" />
          <line x1="62" y1="44" x2="80" y2="44" stroke="#7C69EF" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export const CountingObjectSvg: React.FC<{
  type: NumberItem['objectType'];
  size?: number;
  highlighted?: boolean;
}> = ({ type, size = 48, highlighted = false }) => {
  const scaleClass = highlighted ? 'scale-110' : 'scale-100';

  if (type === 'apple') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        className={`transition-transform duration-200 ${scaleClass}`}
        aria-hidden="true"
      >
        <path
          d="M28 16C20 16 12 22 12 33C12 43 19 50 25.5 50C27 50 28 49 28 49C28 49 29 50 30.5 50C37 50 44 43 44 33C44 22 36 16 28 16Z"
          fill="#E5534B"
        />
        <path d="M28 16C28 11 30 8 33 6" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <path d="M29 11C34 9 38 11 38 14C34 15 31 14 29 11Z" fill="#4CAF50" />
        <ellipse cx="21" cy="27" rx="2.5" ry="5" transform="rotate(-12 21 27)" fill="#FFFFFF" fillOpacity="0.4" />
      </svg>
    );
  }

  if (type === 'ball') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        className={`transition-transform duration-200 ${scaleClass}`}
        aria-hidden="true"
      >
        <circle cx="28" cy="28" r="20" fill="#4A90E2" />
        <path d="M12 20C21 24 35 24 44 20" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M12 36C21 32 35 32 44 36" stroke="#FFC107" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="28" cy="28" r="20" stroke="#1E40AF" strokeOpacity="0.2" strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'duck') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        className={`transition-transform duration-200 ${scaleClass}`}
        aria-hidden="true"
      >
        <ellipse cx="29" cy="36" rx="16" ry="12" fill="#FBBF24" />
        <circle cx="22" cy="21" r="10" fill="#FBBF24" />
        <path d="M13 21L7 23L13 25Z" fill="#EA580C" />
        <circle cx="19" cy="19" r="2" fill="#1E293B" />
        <path d="M25 35C30 33 36 34 39 38" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'orange') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        className={`transition-transform duration-200 ${scaleClass}`}
        aria-hidden="true"
      >
        <circle cx="28" cy="31" r="18" fill="#FB923C" />
        <path d="M28 13C33 9 39 10 40 14C35 16 31 15 28 13Z" fill="#4CAF50" />
        <circle cx="22" cy="24" r="3" fill="#FFFFFF" fillOpacity="0.35" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      className={`transition-transform duration-200 ${scaleClass}`}
      aria-hidden="true"
    >
      <rect x="10" y="14" width="36" height="32" rx="8" fill="#4CAF50" />
      <rect x="16" y="8" width="10" height="8" rx="3" fill="#4CAF50" />
      <rect x="30" y="8" width="10" height="8" rx="3" fill="#4CAF50" />
      <rect x="16" y="21" width="24" height="18" rx="4" fill="#FFFFFF" fillOpacity="0.25" />
    </svg>
  );
};

export const EmotionIllustration: React.FC<{
  emotionId: EmotionItem['id'];
  size?: number;
}> = ({ emotionId, size = 108 }) => {
  if (emotionId === 'happy') {
    return (
      <svg width={size} height={size} viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle cx="56" cy="56" r="50" fill="#DCFCE7" />
        <circle cx="56" cy="56" r="36" fill="#FFE082" stroke="#F59E0B" strokeWidth="3" />
        {/* Warm rosy cheeks */}
        <circle cx="37" cy="60" r="5" fill="#F87171" fillOpacity="0.35" />
        <circle cx="75" cy="60" r="5" fill="#F87171" fillOpacity="0.35" />
        {/* Cheerful curved eyes */}
        <path d="M38 49C40 44 45 44 47 49" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M65 49C67 44 72 44 74 49" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        {/* Wide gentle smile */}
        <path d="M41 64C45 73 67 73 71 64" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (emotionId === 'sad') {
    return (
      <svg width={size} height={size} viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle cx="56" cy="56" r="50" fill="#DBEAFE" />
        <circle cx="56" cy="56" r="36" fill="#FDE68A" stroke="#60A5FA" strokeWidth="3" />
        {/* Sad eyebrows */}
        <path d="M36 45L46 42" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <path d="M76 45L66 42" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="43" cy="52" r="3.5" fill="#1E293B" />
        <circle cx="69" cy="52" r="3.5" fill="#1E293B" />
        {/* Tear drop */}
        <path
          d="M40 58C40 58 36 64 36 67C36 69.2 37.8 71 40 71C42.2 71 44 69.2 44 67C44 64 40 58 40 58Z"
          fill="#4A90E2"
        />
        {/* Sad mouth */}
        <path d="M43 72C48 66 64 66 69 72" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (emotionId === 'worried') {
    return (
      <svg width={size} height={size} viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle cx="56" cy="56" r="50" fill="#FFEDD5" />
        <circle cx="56" cy="56" r="36" fill="#FDE68A" stroke="#FB923C" strokeWidth="3" />
        {/* Worried brows */}
        <path d="M36 43C40 40 44 41 47 44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <path d="M76 43C72 40 68 41 65 44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="43" cy="52" r="3.8" fill="#1E293B" />
        <circle cx="69" cy="52" r="3.8" fill="#1E293B" />
        {/* Wavy worried mouth */}
        <path
          d="M42 70C46 66 50 72 56 68C62 64 66 70 70 68"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 112 112" fill="none" aria-hidden="true">
      <circle cx="56" cy="56" r="50" fill="#E0E7FF" />
      <circle cx="56" cy="56" r="36" fill="#FDE68A" stroke="#818CF8" strokeWidth="3" />
      {/* Closed sleepy eyes */}
      <path d="M37 52C40 56 46 56 49 52" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M63 52C66 56 72 56 75 52" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      {/* Small peaceful yawning/resting mouth */}
      <ellipse cx="56" cy="68" rx="6" ry="5" fill="#1E293B" fillOpacity="0.8" />
      {/* Gentle Zzz */}
      <text x="77" y="34" fill="#4F46E5" fontSize="14" fontWeight="700">
        z
      </text>
      <text x="86" y="24" fill="#6366F1" fontSize="11" fontWeight="700">
        z
      </text>
    </svg>
  );
};
