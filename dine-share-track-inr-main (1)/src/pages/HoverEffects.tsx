import React from 'react';
import Layout from '@/components/Layout';
import { MagicHoverDemo } from '@/components/MagicHoverDemo';

const HoverEffects: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Magical Hover Effects</h1>
          <p className="text-muted-foreground">Interactive hover effects to enhance the user experience</p>
        </div>
        <MagicHoverDemo />
      </div>
    </Layout>
  );
};

export default HoverEffects; 