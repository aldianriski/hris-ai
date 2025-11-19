'use client';

import { useState, useRef } from 'react';
import { Card, CardBody, Button, Input, Spinner } from '@heroui/react';
import { Upload, X, Eye, Image as ImageIcon, Palette } from 'lucide-react';
import { uploadFile } from '@/lib/storage/upload';
import { ALLOWED_FILE_TYPES } from '@/lib/storage/config';

interface WhiteLabelSettingsProps {
  tenantId: string;
  currentSettings: {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
  onUpdate: (settings: {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
  }) => void;
  disabled?: boolean;
}

export function WhiteLabelSettings({
  tenantId,
  currentSettings,
  onUpdate,
  disabled = false,
}: WhiteLabelSettingsProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentSettings.logoUrl || null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(currentSettings.faviconUrl || null);
  const [primaryColor, setPrimaryColor] = useState(currentSettings.primaryColor || '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(currentSettings.secondaryColor || '#8b5cf6');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setUploadError(null);

      const result = await uploadFile(file, {
        bucket: 'avatars', // Using avatars bucket for logos
        folder: `${tenantId}/logo`,
        allowedTypes: ALLOWED_FILE_TYPES.IMAGES,
        makePublic: true,
      });

      if (!result.success) {
        setUploadError(result.error || 'Failed to upload logo');
        return;
      }

      const uploadedUrl = result.url || result.path;
      setLogoUrl(uploadedUrl || null);
      onUpdate({
        logoUrl: uploadedUrl,
        faviconUrl,
        primaryColor,
        secondaryColor,
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      setUploadError('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFavicon(true);
      setUploadError(null);

      const result = await uploadFile(file, {
        bucket: 'avatars', // Using avatars bucket for favicons
        folder: `${tenantId}/favicon`,
        allowedTypes: ALLOWED_FILE_TYPES.IMAGES,
        makePublic: true,
      });

      if (!result.success) {
        setUploadError(result.error || 'Failed to upload favicon');
        return;
      }

      const uploadedUrl = result.url || result.path;
      setFaviconUrl(uploadedUrl || null);
      onUpdate({
        logoUrl,
        faviconUrl: uploadedUrl,
        primaryColor,
        secondaryColor,
      });
    } catch (error) {
      console.error('Favicon upload error:', error);
      setUploadError('Failed to upload favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    onUpdate({
      logoUrl: null,
      faviconUrl,
      primaryColor,
      secondaryColor,
    });
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconUrl(null);
    onUpdate({
      logoUrl,
      faviconUrl: null,
      primaryColor,
      secondaryColor,
    });
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    onUpdate({
      logoUrl,
      faviconUrl,
      primaryColor: color,
      secondaryColor,
    });
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    onUpdate({
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor: color,
    });
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Upload & Colors */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Company Logo
                </h4>
              </div>

              <div className="space-y-4">
                {logoUrl ? (
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center p-4">
                      <img
                        src={logoUrl}
                        alt="Company Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="absolute top-2 right-2"
                      onPress={handleRemoveLogo}
                      isDisabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={disabled || uploadingLogo}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={uploadingLogo ? <Spinner size="sm" /> : <Upload className="w-4 h-4" />}
                      onPress={() => logoInputRef.current?.click()}
                      isDisabled={disabled || uploadingLogo}
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, SVG, or WebP (Max 5MB)
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recommended size: 200x60px. Used in header and emails.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Favicon Upload */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Favicon
                </h4>
              </div>

              <div className="space-y-4">
                {faviconUrl ? (
                  <div className="relative">
                    <div className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center p-4">
                      <img
                        src={faviconUrl}
                        alt="Favicon"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="absolute top-2 right-2"
                      onPress={handleRemoveFavicon}
                      isDisabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/svg+xml,image/x-icon"
                      onChange={handleFaviconUpload}
                      className="hidden"
                      disabled={disabled || uploadingFavicon}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={uploadingFavicon ? <Spinner size="sm" /> : <Upload className="w-4 h-4" />}
                      onPress={() => faviconInputRef.current?.click()}
                      isDisabled={disabled || uploadingFavicon}
                    >
                      {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 32x32px or 64x64px PNG/ICO
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Color Pickers */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Brand Colors
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                      disabled={disabled}
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                      isDisabled={disabled}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used for buttons, links, and accents
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => handleSecondaryColorChange(e.target.value)}
                      className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                      disabled={disabled}
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => handleSecondaryColorChange(e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                      isDisabled={disabled}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used for gradients and secondary elements
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    handlePrimaryColorChange('#6366f1');
                    handleSecondaryColorChange('#8b5cf6');
                  }}
                  isDisabled={disabled}
                >
                  Reset to Default Colors
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Live Preview
                </h4>
              </div>

              <div className="space-y-4">
                {/* Header Preview */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="p-4 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo Preview"
                            className="h-8 object-contain bg-white/10 backdrop-blur px-2 py-1 rounded"
                          />
                        ) : (
                          <div className="h-8 px-4 bg-white/10 backdrop-blur rounded flex items-center">
                            <span className="text-sm font-semibold">Your Logo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Dashboard
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                        >
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Application Header Preview
                    </p>
                  </div>
                </div>

                {/* Button Preview */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    Button Styles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-transform hover:scale-105"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-transform hover:scale-105"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Secondary Button
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-lg border-2 transition-transform hover:scale-105"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                    >
                      Outline Button
                    </button>
                  </div>
                </div>

                {/* Card Preview */}
                <div
                  className="p-4 rounded-lg text-white"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <p className="text-xs opacity-90 mb-1">Dashboard Card</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-xs opacity-75 mt-1">Total Employees</p>
                </div>

                {/* Browser Tab Preview */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    Browser Tab
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon" className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm" />
                    )}
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      HRIS - Dashboard
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardBody>
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                White-Label Branding
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Customize your company's branding to create a consistent experience for your
                employees. These settings affect the application interface, emails, and public-facing
                pages.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
