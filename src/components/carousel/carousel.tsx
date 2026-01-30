import React, { useState, useEffect } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = children.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  return (
    <div className="carousel-container">
      <div 
        className="carousel" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {children}
      </div>
      
      <div className="carousel-indicators">
        {children.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Перейти к слайду ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
      
    </div>
    
  );
};

export default Carousel;
