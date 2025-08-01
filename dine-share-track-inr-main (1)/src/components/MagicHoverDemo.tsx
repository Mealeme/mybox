import React from "react";
import { MagicHover } from "./ui/magic-hover";

export function MagicHoverDemo() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h2 className="text-3xl font-bold mb-6">Magical Hover Effects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <h3 className="text-lg font-medium mb-3">Primary Effect</h3>
          <MagicHover className="p-8 border rounded-lg flex items-center justify-center h-40">
            <div className="text-center">
              <span className="text-xl font-semibold">Hover Me</span>
              <p className="text-sm text-muted-foreground mt-2">Purple glow effect</p>
            </div>
          </MagicHover>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Secondary Effect</h3>
          <MagicHover variant="secondary" className="p-8 border rounded-lg flex items-center justify-center h-40">
            <div className="text-center">
              <span className="text-xl font-semibold">Hover Me</span>
              <p className="text-sm text-muted-foreground mt-2">Pink glow effect</p>
            </div>
          </MagicHover>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Shine Effect</h3>
          <MagicHover variant="shine" className="p-8 border rounded-lg flex items-center justify-center h-40">
            <div className="text-center">
              <span className="text-xl font-semibold">Hover Me</span>
              <p className="text-sm text-muted-foreground mt-2">White spotlight effect</p>
            </div>
          </MagicHover>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Border Effect</h3>
          <MagicHover variant="border" className="p-8 rounded-lg flex items-center justify-center h-40">
            <div className="text-center">
              <span className="text-xl font-semibold">Hover Me</span>
              <p className="text-sm text-muted-foreground mt-2">Glowing border effect</p>
            </div>
          </MagicHover>
        </div>
      </div>
      
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4">Real-World Example</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <MagicHover key={item} className="p-6 border rounded-lg">
              <div className="h-32 bg-muted rounded-md mb-4"></div>
              <h4 className="text-lg font-medium mb-2">Feature {item}</h4>
              <p className="text-sm text-muted-foreground">
                This is a sample card with our magical hover effect. Move your mouse
                around to see the interactive glow.
              </p>
            </MagicHover>
          ))}
        </div>
      </div>
    </div>
  );
} 