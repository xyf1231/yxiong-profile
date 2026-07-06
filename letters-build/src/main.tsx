import React from 'react';
import { createRoot } from 'react-dom/client';
import { Letters } from '@kumailnanji/letters';

function LettersApp({ text, color = '#ffffff', strokeWidth = 2 }: { text: string; color?: string; strokeWidth?: number }) {
  return (
    <Letters
      text={text}
      autoPlay
      strokeWidth={strokeWidth}
      color={color}
      className="letters-animation-svg"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// 全局挂载函数，供原生 JS 调用
(window as any).mountLettersAnimation = function(container: HTMLElement, text: string, color?: string, strokeWidth?: number) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LettersApp text={text} color={color} strokeWidth={strokeWidth} />
    </React.StrictMode>
  );
  return root;
};

// 如果容器已存在，自动挂载
const autoContainer = document.getElementById('letters-animation-container');
if (autoContainer) {
  const text = autoContainer.dataset.text || 'Hello';
  const color = autoContainer.dataset.color || '#ffffff';
  const strokeWidth = parseFloat(autoContainer.dataset.strokeWidth || '2');
  (window as any).mountLettersAnimation(autoContainer, text, color, strokeWidth);
}
