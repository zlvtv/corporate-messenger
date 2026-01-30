import React from 'react';

interface SlideProps {
  title: string;
  description: string;
  imageUrl: string;
}

const Slide: React.FC<SlideProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="carousel-slide">
      <div className="slide-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div 
        className="slide-image" 
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="slide-overlay" />
      </div>
    </div>
  );
};

export default Slide;
