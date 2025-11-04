'use client'

import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { FormField } from '@/components/forms/shared/FormField';

interface HCaptchaFieldProps {
  sitekey: string;
  onVerify: (token: string, eKey: string) => void;
  onError?: (err: string) => void;
  onExpire?: () => void;
  onLoad?: () => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark' | 'contrast' | Record<string, unknown>;
  tabIndex?: number;
  languageOverride?: string;
  reCaptchaCompat?: boolean;
  id?: string;
  error?: string;
  required?: boolean;
}

export const HCaptchaField: React.FC<HCaptchaFieldProps> = ({
  sitekey,
  onVerify,
  onError,
  onExpire,
  onLoad,
  size = 'normal',
  theme = 'light',
  tabIndex = 0,
  languageOverride,
  reCaptchaCompat = true,
  id,
  error,
  required = false
}) => (
  <FormField 
    label="hCaptcha Verification" 
    error={error} 
    required={required}
  >
    <div className="flex justify-center">
      <HCaptcha
        sitekey={sitekey}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpire}
        onLoad={onLoad}
        size={size}
        theme={theme}
        tabIndex={tabIndex}
        languageOverride={languageOverride}
        reCaptchaCompat={reCaptchaCompat}
        id={id}
      />
    </div>
  </FormField>
);

export default HCaptchaField;