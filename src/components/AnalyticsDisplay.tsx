
import { useEffect, useRef } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import * as THREE from 'three';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Sample data for enhanced analytics charts
  const weeklyData = [
    { name: 'Mon', complaints: 12, resolved: 10 },
    { name: 'Tue', complaints: 19, resolved: 15 },
    { name: 'Wed', complaints: 15, resolved: 12 },
    { name: 'Thu', complaints: 22, resolved: 17 },
    { name: 'Fri', complaints: 18, resolved: 14 },
    { name: 'Sat', complaints: 8, resolved: 7 },
    { name: 'Sun', complaints: 5, resolved: 5 },
  ];

  const categoryData = [
    { name: 'Product', value: 35 },
    { name: 'Payment', value: 25 },
    { name: 'Employee', value: 18 },
    { name: 'Vendor', value: 12 },
    { name: 'Legal', value: 10 },
  ];

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
    <GlassmorphicCard className="p-6">
      <h3 className="text-2xl font-bold mb-6 text-gradient-teal">Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Resolution Rate</h4>
            
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

            <div className="mt-8">
              <h4 className="text-lg font-medium mb-4">Weekly Complaints Trend</h4>
              <div className="h-[200px] w-full bg-background/10 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(30, 42, 68, 0.8)',
                        borderColor: '#2DD4BF',
                        borderRadius: '8px',
                        color: 'white'
                      }} 
                    />
                    <Bar dataKey="complaints" fill="#F472B6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Urgent Cases This Week</h4>
            
            <div className="flex items-center mb-6">
              <div className="mr-4 w-[180px] h-[120px]" ref={sphereContainerRef}></div>
              
              <div>
                <p className="text-3xl font-bold text-coral">{urgentCases}</p>
                <p className="text-xs text-foreground/60">High priority issues</p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-medium mb-4">Response Time</h4>
              <div className="bg-background/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Average:</span>
                  <span className="text-sm font-medium text-teal">2.4 hours</span>
                </div>
                <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-teal rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-foreground/50">0h</span>
                  <span className="text-xs text-foreground/50">24h</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">Complaint Categories</h4>
                <div className="space-y-3">
                  {categoryData.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-xs">{category.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-coral/70 rounded-full" 
                          style={{ width: `${category.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default AnalyticsDisplay;
