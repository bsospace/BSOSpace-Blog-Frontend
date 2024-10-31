// ScrollProgressBar.js
import React, { useEffect, useState } from 'react';

const ScrollProgressBar = () => {
    const [scrollPercent, setScrollPercent] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            const scrollProgress = (currentScroll / totalHeight) * 100;
            setScrollPercent(scrollProgress);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: `${scrollPercent}%`,
                height: '2px',
                backgroundImage: 'linear-gradient(to right, #7e22ce, #ec4899, #fb923c)',
                zIndex: 1000,
                transition: 'width 0.25s ease',
            }}
        />

    );
};

export default ScrollProgressBar;
