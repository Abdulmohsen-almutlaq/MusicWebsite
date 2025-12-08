import React from 'react';

const HorizontalSection = ({ title, children }) => (
  <section>
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
      {children}
    </div>
  </section>
);

export default HorizontalSection;
