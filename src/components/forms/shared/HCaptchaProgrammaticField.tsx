'use client'

import React, { useRef, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { FormField } from '@/components/forms/shared/FormField';

interface HCaptchaProgrammaticFieldProps {
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
  executeOnLoad?: boolean;
}

export const HCaptchaProgrammaticField: React.FC<HCaptchaProgrammaticFieldProps> = ({
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
  required = false,
  executeOnLoad = false
}) => {
  const captchaRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (executeOnLoad && captchaRef.current) {
      // Execute the captcha after component has loaded and is ready
      setTimeout(() => {
        captchaRef.current?.execute();
      }, 500);
    }
  }, [executeOnLoad]);

  return (
    <FormField 
      label="hCaptcha Verification" 
      error={error} 
      required={required}
    >
      <div className="flex justify-center">
        <HCaptcha
          ref={captchaRef}
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
      <div className="mt-2 flex space-x-2">
        <button 
          type="button" 
          onClick={() => {
            if (captchaRef.current) {
              captchaRef.current?.execute();
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Execute Captcha
        </button>
        <button 
          type="button" 
          onClick={() => {
            if (captchaRef.current) {
              captchaRef.current?.resetCaptcha();
            }
          }}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset Captcha
        </button>
      </div>
    </FormField>
  );
};

export default HCaptchaProgrammaticField;