import React from 'react';

const WineCard = ({ wine }) => {
  // Determine variety category for styling
  const getVarietyStyle = (variety) => {
    if (!variety) return 'default';
    
    const varietyLower = variety.toLowerCase();
    
    // Red wines
    const redVarieties = ['shiraz', 'syrah', 'cabernet sauvignon', 'pinot noir', 'merlot', 
                          'tempranillo', 'sangiovese', 'grenache', 'mourvedre', 'nebbiolo',
                          'malbec', 'cabernet franc', 'petit verdot', 'barbera', 'montepulciano'];
    if (redVarieties.some(v => varietyLower.includes(v))) {
      return 'red';
    }
    
    // White wines
    const whiteVarieties = ['chardonnay', 'riesling', 'sauvignon blanc', 'pinot gris', 'pinot grigio',
                            'semillon', 'gewurztraminer', 'viognier', 'marsanne', 'roussanne',
                            'vermentino', 'fiano', 'arneis', 'chenin blanc', 'verdelho'];
    if (whiteVarieties.some(v => varietyLower.includes(v))) {
      return 'white';
    }
    
    // Rosé
    if (varietyLower.includes('rose') || varietyLower.includes('rosé')) {
      return 'rose';
    }
    
    // Sparkling
    const sparklingVarieties = ['sparkling', 'prosecco', 'champagne', 'blanc de blanc', 
                                'blanc de noirs', 'methode traditionnelle', 'moscato'];
    if (sparklingVarieties.some(v => varietyLower.includes(v))) {
      return 'sparkling';
    }
    
    return 'default';
  };

  const varietyCategory = getVarietyStyle(wine.variety);

  // Variety-specific styling
  const cardStyles = {
    red: {
      bg: 'bg-gradient-to-br from-[#722F37] to-[#8B3A3A]',
      text: 'text-white',
      badge: 'bg-[#C77B7B] text-white',
      border: 'border-[#722F37]',
      hover: 'hover:shadow-2xl hover:shadow-red-900/50'
    },
    white: {
      bg: 'bg-gradient-to-br from-[#F5F5DC] to-[#FDFBF3]',
      text: 'text-[#36454F]',
      badge: 'bg-[#D4AF37] text-white',
      border: 'border-[#D4AF37]',
      hover: 'hover:shadow-2xl hover:shadow-amber-200/50'
    },
    rose: {
      bg: 'bg-gradient-to-br from-[#FFE4E1] to-[#FFC0CB]',
      text: 'text-[#722F37]',
      badge: 'bg-[#C77B7B] text-white',
      border: 'border-[#C77B7B]',
      hover: 'hover:shadow-2xl hover:shadow-pink-300/50'
    },
    sparkling: {
      bg: 'bg-gradient-to-br from-[#FFFACD] to-[#F5F5DC]',
      text: 'text-[#36454F]',
      badge: 'bg-[#D4AF37] text-white',
      border: 'border-[#D4AF37]',
      hover: 'hover:shadow-2xl hover:shadow-yellow-200/50',
      bubbles: true
    },
    default: {
      bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      text: 'text-gray-800',
      badge: 'bg-gray-600 text-white',
      border: 'border-gray-400',
      hover: 'hover:shadow-2xl hover:shadow-gray-400/50'
    }
  };

  const style = cardStyles[varietyCategory];

  return (
    <div className={`
      relative overflow-hidden rounded-lg shadow-lg 
      ${style.bg} ${style.border} border-2
      transition-all duration-300 transform
      ${style.hover} hover:scale-105
      min-h-[320px] flex flex-col
    `}>
      {/* Sparkling bubbles background effect */}
      {style.bubbles && (
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="bubble-animation">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: '-20px',
                  animation: `bubble-rise ${Math.random() * 3 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col flex-grow">
        {/* Header with Variety Badge */}
        <div className="flex items-start justify-between mb-3">
          {wine.variety && (
            <span className={`
              ${style.badge} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
            `}>
              {wine.variety}
            </span>
          )}
          {wine.vintage && (
            <span className={`
              ${style.text} font-bold text-sm px-2 py-1 
              bg-white/20 rounded backdrop-blur-sm
            `}>
              {wine.vintage}
            </span>
          )}
        </div>

        {/* Wine Name */}
        <h3 className={`${style.text} text-xl font-bold mb-2 leading-tight flex-grow`}>
          {wine.name}
        </h3>

        {/* Winery Name */}
        <p className={`${style.text} opacity-80 text-sm mb-4 italic`}>
          {wine.winery?.name || 'Unknown Winery'}
        </p>

        {/* Description */}
        {wine.description && (
          <p className={`${style.text} opacity-75 text-sm mb-4 line-clamp-3`}>
            {wine.description}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
          <div className={`${style.text} text-2xl font-bold`}>
            ${wine.price?.toFixed(2) || 'N/A'}
          </div>
          <a
            href={wine.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              px-5 py-2 rounded-full font-semibold text-sm
              transition-all duration-200
              ${varietyCategory === 'white' || varietyCategory === 'sparkling' 
                ? 'bg-[#722F37] hover:bg-[#8B3A3A] text-white' 
                : 'bg-white text-[#722F37] hover:bg-[#F5F5DC]'}
              shadow-md hover:shadow-xl transform hover:scale-105
            `}
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default WineCard;
