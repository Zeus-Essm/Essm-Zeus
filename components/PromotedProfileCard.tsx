import React from 'react';
import type { BusinessProfile } from '../types';
import GradientButton from './GradientButton';

interface PromotedProfileCardProps {
  businessProfile: BusinessProfile;
  onVisit: () => void;
}

const PromotedProfileCard: React.FC<PromotedProfileCardProps> = ({ businessProfile, onVisit }) => {
  return (
    <div className="bg-[var(--bg-secondary)] flex flex-col animate-fadeIn border-y border-[var(--border-primary)] my-2">
      <div className="px-3 pt-2">
        <span className="text-xs font-bold text-[var(--text-secondary)]">Promovido</span>
      </div>
      
      <div className="p-4 flex flex-col items-center text-center">
        <img 
          src={businessProfile.logo_url} 
          alt={businessProfile.business_name} 
          className="w-20 h-20 rounded-full object-cover border-2 border-[var(--accent-primary)] mb-3" 
        />
        <h3 className="font-bold text-lg">{businessProfile.business_name}</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
          {businessProfile.description}
        </p>
      </div>

      <div className="p-4">
        <GradientButton onClick={onVisit} className="!py-3 text-sm">
            Visitar Perfil
        </GradientButton>
      </div>
    </div>
  );
};

export default PromotedProfileCard;