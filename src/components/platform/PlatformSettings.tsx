'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Tabs,
  Tab,
  Input,
  Switch,
  Select,
  SelectItem,
  Textarea,
  Divider,
} from '@heroui/react';
import {
  Settings,
  Save,
  Shield,
  Mail,
  Sparkles,
  CreditCard,
  Users,
  ToggleLeft,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformSettingsData {
  id: string;
  // General
  platform_name: string;
  platform_logo_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  default_timezone: string;
  default_language: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  // Security
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  password_expiry_days: number;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  enforce_mfa: boolean;
  allowed_email_domains: string[];
  // Email
  smtp_host: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_from_email: string | null;
  smtp_from_name: string | null;
  smtp_use_tls: boolean;
  email_provider: string;
  // AI
  ai_enabled: boolean;
  ai_provider: string;
  ai_model: string;
  ai_max_tokens: number;
  ai_temperature: number;
  // Payment
  payment_gateway: string;
  payment_gateway_mode: string;
  stripe_publishable_key: string | null;
  midtrans_client_key: string | null;
  // System Limits
  max_tenants: number | null;
  max_users_per_tenant: number;
  max_file_upload_mb: number;
  max_storage_gb_per_tenant: number;
  // Feature Toggles
  enable_new_tenant_registration: boolean;
  enable_sso: boolean;
  enable_api_access: boolean;
  enable_webhooks: boolean;
  enable_audit_logs: boolean;
  // Billing
  tax_rate: number;
  tax_name: string;
  currency_code: string;
  billing_cycle_day: number;
  trial_period_days: number;
  grace_period_days: number;
}

export function PlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/settings');

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const { data } = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      const response = await fetch('/api/platform/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof PlatformSettingsData>(
    key: K,
    value: PlatformSettingsData[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="w-12 h-12 text-danger mb-4" />
        <h3 className="text-lg font-semibold">Failed to load settings</h3>
        <Button color="primary" onPress={fetchSettings} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          onPress={handleSave}
          isLoading={saving}
        >
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardBody>
          <Tabs
            aria-label="Settings tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
            }}
          >
            {/* General Tab */}
            <Tab
              key="general"
              title={
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>General</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <Input
                  label="Platform Name"
                  value={settings.platform_name}
                  onChange={(e) => updateSetting('platform_name', e.target.value)}
                />

                <Input
                  label="Platform Logo URL"
                  placeholder="https://example.com/logo.png"
                  value={settings.platform_logo_url || ''}
                  onChange={(e) => updateSetting('platform_logo_url', e.target.value || null)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Support Email"
                    type="email"
                    placeholder="support@example.com"
                    value={settings.support_email || ''}
                    onChange={(e) => updateSetting('support_email', e.target.value || null)}
                  />

                  <Input
                    label="Support Phone"
                    placeholder="+62 21 1234 5678"
                    value={settings.support_phone || ''}
                    onChange={(e) => updateSetting('support_phone', e.target.value || null)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Default Timezone"
                    selectedKeys={[settings.default_timezone]}
                    onChange={(e) => updateSetting('default_timezone', e.target.value)}
                  >
                    <SelectItem key="Asia/Jakarta" value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                    <SelectItem key="Asia/Makassar" value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                    <SelectItem key="Asia/Jayapura" value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                    <SelectItem key="UTC" value="UTC">UTC</SelectItem>
                  </Select>

                  <Select
                    label="Default Language"
                    selectedKeys={[settings.default_language]}
                    onChange={(e) => updateSetting('default_language', e.target.value)}
                  >
                    <SelectItem key="en" value="en">English</SelectItem>
                    <SelectItem key="id" value="id">Bahasa Indonesia</SelectItem>
                  </Select>
                </div>

                <Divider />

                <div className="space-y-4">
                  <Switch
                    isSelected={settings.maintenance_mode}
                    onValueChange={(value) => updateSetting('maintenance_mode', value)}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Maintenance Mode</span>
                      <span className="text-xs text-gray-500">
                        Temporarily disable access to the platform
                      </span>
                    </div>
                  </Switch>

                  {settings.maintenance_mode && (
                    <Textarea
                      label="Maintenance Message"
                      placeholder="We're currently performing maintenance. Please check back later."
                      value={settings.maintenance_message || ''}
                      onChange={(e) => updateSetting('maintenance_message', e.target.value || null)}
                      minRows={3}
                    />
                  )}
                </div>
              </div>
            </Tab>

            {/* Security Tab */}
            <Tab
              key="security"
              title={
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <h3 className="text-lg font-semibold">Password Policy</h3>

                <Input
                  label="Minimum Password Length"
                  type="number"
                  min={6}
                  max={32}
                  value={String(settings.password_min_length)}
                  onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Switch
                    isSelected={settings.password_require_uppercase}
                    onValueChange={(value) => updateSetting('password_require_uppercase', value)}
                  >
                    Require uppercase letters
                  </Switch>

                  <Switch
                    isSelected={settings.password_require_lowercase}
                    onValueChange={(value) => updateSetting('password_require_lowercase', value)}
                  >
                    Require lowercase letters
                  </Switch>

                  <Switch
                    isSelected={settings.password_require_numbers}
                    onValueChange={(value) => updateSetting('password_require_numbers', value)}
                  >
                    Require numbers
                  </Switch>

                  <Switch
                    isSelected={settings.password_require_special}
                    onValueChange={(value) => updateSetting('password_require_special', value)}
                  >
                    Require special characters
                  </Switch>
                </div>

                <Input
                  label="Password Expiry (days)"
                  description="0 = never expires"
                  type="number"
                  min={0}
                  value={String(settings.password_expiry_days)}
                  onChange={(e) => updateSetting('password_expiry_days', parseInt(e.target.value))}
                />

                <Divider />

                <h3 className="text-lg font-semibold">Session & Login</h3>

                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  min={5}
                  value={String(settings.session_timeout_minutes)}
                  onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Max Login Attempts"
                    type="number"
                    min={3}
                    max={10}
                    value={String(settings.max_login_attempts)}
                    onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                  />

                  <Input
                    label="Lockout Duration (minutes)"
                    type="number"
                    min={5}
                    value={String(settings.lockout_duration_minutes)}
                    onChange={(e) => updateSetting('lockout_duration_minutes', parseInt(e.target.value))}
                  />
                </div>

                <Switch
                  isSelected={settings.enforce_mfa}
                  onValueChange={(value) => updateSetting('enforce_mfa', value)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Enforce Multi-Factor Authentication</span>
                    <span className="text-xs text-gray-500">
                      Require all users to enable MFA
                    </span>
                  </div>
                </Switch>
              </div>
            </Tab>

            {/* Email Tab */}
            <Tab
              key="email"
              title={
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <Select
                  label="Email Provider"
                  selectedKeys={[settings.email_provider]}
                  onChange={(e) => updateSetting('email_provider', e.target.value)}
                >
                  <SelectItem key="smtp" value="smtp">SMTP</SelectItem>
                  <SelectItem key="sendgrid" value="sendgrid">SendGrid</SelectItem>
                  <SelectItem key="ses" value="ses">AWS SES</SelectItem>
                  <SelectItem key="resend" value="resend">Resend</SelectItem>
                </Select>

                {settings.email_provider === 'smtp' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="SMTP Host"
                        placeholder="smtp.gmail.com"
                        value={settings.smtp_host || ''}
                        onChange={(e) => updateSetting('smtp_host', e.target.value || null)}
                        className="md:col-span-2"
                      />

                      <Input
                        label="Port"
                        type="number"
                        value={String(settings.smtp_port)}
                        onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                      />
                    </div>

                    <Input
                      label="SMTP Username"
                      value={settings.smtp_username || ''}
                      onChange={(e) => updateSetting('smtp_username', e.target.value || null)}
                    />

                    <Switch
                      isSelected={settings.smtp_use_tls}
                      onValueChange={(value) => updateSetting('smtp_use_tls', value)}
                    >
                      Use TLS/SSL
                    </Switch>
                  </>
                )}

                <Divider />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="From Email"
                    type="email"
                    placeholder="noreply@example.com"
                    value={settings.smtp_from_email || ''}
                    onChange={(e) => updateSetting('smtp_from_email', e.target.value || null)}
                  />

                  <Input
                    label="From Name"
                    placeholder="HRIS Platform"
                    value={settings.smtp_from_name || ''}
                    onChange={(e) => updateSetting('smtp_from_name', e.target.value || null)}
                  />
                </div>
              </div>
            </Tab>

            {/* AI Tab */}
            <Tab
              key="ai"
              title={
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <Switch
                  isSelected={settings.ai_enabled}
                  onValueChange={(value) => updateSetting('ai_enabled', value)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Enable AI Features</span>
                    <span className="text-xs text-gray-500">
                      Allow AI-powered features across the platform
                    </span>
                  </div>
                </Switch>

                {settings.ai_enabled && (
                  <>
                    <Select
                      label="AI Provider"
                      selectedKeys={[settings.ai_provider]}
                      onChange={(e) => updateSetting('ai_provider', e.target.value)}
                    >
                      <SelectItem key="openai" value="openai">OpenAI</SelectItem>
                      <SelectItem key="anthropic" value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem key="azure" value="azure">Azure OpenAI</SelectItem>
                    </Select>

                    <Input
                      label="AI Model"
                      placeholder="gpt-4"
                      value={settings.ai_model}
                      onChange={(e) => updateSetting('ai_model', e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Max Tokens"
                        type="number"
                        min={100}
                        max={8000}
                        value={String(settings.ai_max_tokens)}
                        onChange={(e) => updateSetting('ai_max_tokens', parseInt(e.target.value))}
                      />

                      <Input
                        label="Temperature"
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={String(settings.ai_temperature)}
                        onChange={(e) => updateSetting('ai_temperature', parseFloat(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </div>
            </Tab>

            {/* Payment Tab */}
            <Tab
              key="payment"
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <Select
                  label="Payment Gateway"
                  selectedKeys={[settings.payment_gateway]}
                  onChange={(e) => updateSetting('payment_gateway', e.target.value)}
                >
                  <SelectItem key="stripe" value="stripe">Stripe</SelectItem>
                  <SelectItem key="midtrans" value="midtrans">Midtrans</SelectItem>
                </Select>

                <Select
                  label="Gateway Mode"
                  selectedKeys={[settings.payment_gateway_mode]}
                  onChange={(e) => updateSetting('payment_gateway_mode', e.target.value)}
                >
                  <SelectItem key="test" value="test">Test Mode</SelectItem>
                  <SelectItem key="live" value="live">Live Mode</SelectItem>
                </Select>

                {settings.payment_gateway === 'stripe' && (
                  <Input
                    label="Stripe Publishable Key"
                    placeholder="pk_test_..."
                    value={settings.stripe_publishable_key || ''}
                    onChange={(e) => updateSetting('stripe_publishable_key', e.target.value || null)}
                  />
                )}

                {settings.payment_gateway === 'midtrans' && (
                  <Input
                    label="Midtrans Client Key"
                    value={settings.midtrans_client_key || ''}
                    onChange={(e) => updateSetting('midtrans_client_key', e.target.value || null)}
                  />
                )}
              </div>
            </Tab>

            {/* System Tab */}
            <Tab
              key="system"
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>System Limits</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <Input
                  label="Max Tenants"
                  description="Leave empty for unlimited"
                  type="number"
                  min={1}
                  value={settings.max_tenants ? String(settings.max_tenants) : ''}
                  onChange={(e) => updateSetting('max_tenants', e.target.value ? parseInt(e.target.value) : null)}
                />

                <Input
                  label="Max Users Per Tenant"
                  type="number"
                  min={1}
                  value={String(settings.max_users_per_tenant)}
                  onChange={(e) => updateSetting('max_users_per_tenant', parseInt(e.target.value))}
                />

                <Input
                  label="Max File Upload Size (MB)"
                  type="number"
                  min={1}
                  max={100}
                  value={String(settings.max_file_upload_mb)}
                  onChange={(e) => updateSetting('max_file_upload_mb', parseInt(e.target.value))}
                />

                <Input
                  label="Max Storage Per Tenant (GB)"
                  type="number"
                  min={1}
                  value={String(settings.max_storage_gb_per_tenant)}
                  onChange={(e) => updateSetting('max_storage_gb_per_tenant', parseInt(e.target.value))}
                />
              </div>
            </Tab>

            {/* Features Tab */}
            <Tab
              key="features"
              title={
                <div className="flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4" />
                  <span>Features</span>
                </div>
              }
            >
              <div className="pt-6 space-y-4">
                <Switch
                  isSelected={settings.enable_new_tenant_registration}
                  onValueChange={(value) => updateSetting('enable_new_tenant_registration', value)}
                >
                  Enable New Tenant Registration
                </Switch>

                <Switch
                  isSelected={settings.enable_sso}
                  onValueChange={(value) => updateSetting('enable_sso', value)}
                >
                  Enable Single Sign-On (SSO)
                </Switch>

                <Switch
                  isSelected={settings.enable_api_access}
                  onValueChange={(value) => updateSetting('enable_api_access', value)}
                >
                  Enable API Access
                </Switch>

                <Switch
                  isSelected={settings.enable_webhooks}
                  onValueChange={(value) => updateSetting('enable_webhooks', value)}
                >
                  Enable Webhooks
                </Switch>

                <Switch
                  isSelected={settings.enable_audit_logs}
                  onValueChange={(value) => updateSetting('enable_audit_logs', value)}
                >
                  Enable Audit Logs
                </Switch>
              </div>
            </Tab>

            {/* Billing Tab */}
            <Tab
              key="billing"
              title={
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Billing</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tax Name"
                    placeholder="VAT, PPN, etc."
                    value={settings.tax_name}
                    onChange={(e) => updateSetting('tax_name', e.target.value)}
                  />

                  <Input
                    label="Tax Rate (%)"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={String(settings.tax_rate)}
                    onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value))}
                  />
                </div>

                <Input
                  label="Currency Code"
                  placeholder="USD, IDR, etc."
                  value={settings.currency_code}
                  onChange={(e) => updateSetting('currency_code', e.target.value)}
                />

                <Input
                  label="Billing Cycle Day"
                  description="Day of the month when billing occurs (1-28)"
                  type="number"
                  min={1}
                  max={28}
                  value={String(settings.billing_cycle_day)}
                  onChange={(e) => updateSetting('billing_cycle_day', parseInt(e.target.value))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Trial Period (days)"
                    type="number"
                    min={0}
                    value={String(settings.trial_period_days)}
                    onChange={(e) => updateSetting('trial_period_days', parseInt(e.target.value))}
                  />

                  <Input
                    label="Grace Period (days)"
                    description="Days after due date before suspension"
                    type="number"
                    min={0}
                    value={String(settings.grace_period_days)}
                    onChange={(e) => updateSetting('grace_period_days', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
