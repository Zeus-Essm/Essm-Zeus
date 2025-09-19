import React, { useState } from 'react';
import Header from './Header';
import { CATEGORIES } from '../constants';
import { GiftIcon } from './IconComponents';

interface RewardsScreenProps {
  onBack: () => void;
}

interface BrandProgressProps {
  brandName: string;
  currentPoints: number;
  maxPoints?: number;
}

const BrandProgress: React.FC<BrandProgressProps> = ({ brandName, currentPoints, maxPoints = 1000 }) => {
    const progressPercentage = Math.min((currentPoints / maxPoints) * 100, 100);
    const hasReachedGoal = currentPoints >= maxPoints;

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg uppercase">{brandName}</h3>
                <span className={`font-semibold ${hasReachedGoal ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {currentPoints.toLocaleString()} / {maxPoints.toLocaleString()} PTS
                </span>
            </div>
            <div className="relative flex items-center gap-2">
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <GiftIcon className={`w-8 h-8 flex-shrink-0 ${hasReachedGoal ? 'text-yellow-400' : 'text-gray-600'}`} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>0</span>
                <span>{maxPoints / 2}</span>
                <span>{maxPoints}</span>
            </div>
        </div>
    );
};


const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
    // Mock data for user points. In a real app, this would come from a database.
    const [points] = useState<Record<string, number>>({
        'new_feeling': 150,
        'noivas': 750,
        'lilas': 1000,
        'adidas': 400,
        'lv': 50 // Not displayed for now, but can be added
    });

    const rewardCategories = CATEGORIES.filter(cat => cat.id !== 'lv');

    return (
        <div className="w-full h-full flex flex-col text-white animate-fadeIn bg-black">
            <Header title="Programa de Recompensas" onBack={onBack} />
            <div className="flex-grow pt-16 overflow-y-auto p-4 space-y-4">
                <div className="text-center mb-4">
                    <img src="https://i.postimg.cc/wjyHYD8S/moeda.png" alt="Recompensas" className="w-16 h-16 mx-auto mb-2"/>
                    <p className="text-gray-300">
                        Ganhe pontos usando itens de cada coleção. Alcance 1000 pontos para desbloquear uma recompensa exclusiva!
                    </p>
                </div>

                {rewardCategories.map(category => (
                    <BrandProgress 
                        key={category.id}
                        brandName={category.name}
                        currentPoints={points[category.id] || 0}
                    />
                ))}
            </div>
        </div>
    );
};

export default RewardsScreen;