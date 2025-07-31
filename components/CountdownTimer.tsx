
import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';

const useTimer = (endTime: string | undefined) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
};

interface CountdownTimerProps {
  title: string;
  endTime: string;
  onFinish: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ title, endTime, onFinish }) => {
  const { minutes, seconds } = useTimer(endTime);
  const onFinishCalled = useRef(false);

  useEffect(() => {
    if (minutes === 0 && seconds === 0 && !onFinishCalled.current) {
      // Check if endTime is in the past
      if(new Date(endTime).getTime() < new Date().getTime()){
        onFinish();
        onFinishCalled.current = true;
      }
    }
  }, [minutes, seconds, endTime, onFinish]);

  return (
    <Card className="text-center bg-brand-accent text-white">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div className="flex items-center justify-center space-x-2">
        <Icon name="Timer" size={32} />
        <p className="text-4xl font-mono tracking-widest">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
      <p className="text-sm mt-2">Tempo restante</p>
    </Card>
  );
};
