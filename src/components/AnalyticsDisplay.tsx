
import { useEffect, useRef } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import * as THREE from 'three';

interface AnalyticsDisplayProps {
  resolvedPercentage: number;
  urgentCases: number;
}

const AnalyticsDisplay = ({
  resolvedPercentage,
  urgentCases,
}: AnalyticsDisplayProps) => {
  const barContainerRef = useRef<HTMLDivElement>(null);
  const sphereContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sphereContainerRef.current) return;

    // Set up scene for sphere visualization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      180 / 120,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(180, 120);
    sphereContainerRef.current.appendChild(renderer.domElement);

    // Create spheres for urgent cases
    const spheres: THREE.Mesh[] = [];
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    
    const coralMaterial = new THREE.MeshBasicMaterial({
      color: 0xF472B6,
      transparent: true,
      opacity: 0.8,
    });
    
    const sphereCount = Math.min(urgentCases, 12); // Limit to 12 max spheres
    
    for (let i = 0; i < sphereCount; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, coralMaterial);
      
      // Position spheres in a circular pattern
      const angle = (i / sphereCount) * Math.PI * 2;
      const radius = 3;
      sphere.position.x = Math.cos(angle) * radius;
      sphere.position.y = Math.sin(angle) * radius;
      sphere.position.z = Math.random() * 2 - 1;
      
      spheres.push(sphere);
      scene.add(sphere);
    }
    
    camera.position.z = 7;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate and animate spheres
      spheres.forEach((sphere, i) => {
        const time = Date.now() * 0.001;
        const offset = i * 0.2;
        
        sphere.position.y += Math.sin(time + offset) * 0.01;
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      if (sphereContainerRef.current && sphereContainerRef.current.contains(renderer.domElement)) {
        sphereContainerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      sphereGeometry.dispose();
      coralMaterial.dispose();
      renderer.dispose();
    };
  }, [urgentCases]);

  return (
    <GlassmorphicCard>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">Analytics Dashboard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Resolution Rate</p>
            
            <div className="mb-4" ref={barContainerRef}>
              <div className="h-8 w-full bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal flex items-center justify-end transition-all duration-1000 ease-out p-2"
                  style={{ width: `${resolvedPercentage}%` }}
                >
                  <span className="text-xs font-medium">{resolvedPercentage}%</span>
                </div>
              </div>
              <p className="text-xs mt-1 text-foreground/60">
                Complaints successfully resolved
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Urgent Cases This Week</p>
            
            <div className="flex items-center">
              <div className="mr-4 w-[180px] h-[120px]" ref={sphereContainerRef}></div>
              
              <div>
                <p className="text-3xl font-bold text-coral">{urgentCases}</p>
                <p className="text-xs text-foreground/60">High priority issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default AnalyticsDisplay;
