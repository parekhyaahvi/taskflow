/**
 * TaskFlow Dynamic Background Effects
 * Handles mouse tracking and interactive background glows
 */

document.addEventListener('DOMContentLoaded', () => {
    let targetX = 50;
    let targetY = 50;
    
    // 10 segments for an ultra-long trail
    // Each segment follows the one in front with organic inertia
    const segments = Array.from({ length: 10 }, (_, i) => ({
        x: 50,
        y: 50,
        factor: 0.2 - (i * 0.015) // Gradually decreasing factor for longer trail
    }));

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth) * 100;
        targetY = (e.clientY / window.innerHeight) * 100;
    });

    const animate = () => {
        // Calculate global opacity based on x-position (dimmer on the right/form side)
        // If x > 60%, reduce opacity gradually
        const rightSideBuffer = 60;
        let globalOpacity = 1;
        
        if (targetX > rightSideBuffer) {
            // Fade from 1.0 to 0.3 as it moves deep into the right side
            globalOpacity = 1 - (Math.min(1, (targetX - rightSideBuffer) / 30) * 0.7);
        }

        segments.forEach((seg, i) => {
            const prevX = i === 0 ? targetX : segments[i-1].x;
            const prevY = i === 0 ? targetY : segments[i-1].y;

            // Smooth linear interpolation
            seg.x += (prevX - seg.x) * seg.factor;
            seg.y += (prevY - seg.y) * seg.factor;

            document.documentElement.style.setProperty(`--glow-${i+1}-x`, `${seg.x}%`);
            document.documentElement.style.setProperty(`--glow-${i+1}-y`, `${seg.y}%`);
        });

        // Apply opacity ONLY to the background glow via CSS variable
        document.documentElement.style.setProperty('--glow-opacity', globalOpacity);

        requestAnimationFrame(animate);
    };

    animate();
});
