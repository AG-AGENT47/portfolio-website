'use client';
import { useEffect } from 'react';
import { pingHealth } from '@/lib/api';

export function HealthWarmup() {
  useEffect(() => { pingHealth(); }, []);
  return null;
}
