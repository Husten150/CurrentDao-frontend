export type MobilePlatform = 'ios' | 'android' | 'cross-platform'

export type WalletCategory =
  | 'native'
  | 'banking'
  | 'exchange'
  | 'energy'
  | 'super-app'
  | 'defi'

export type SecurityTier = 'standard' | 'enhanced' | 'institutional'

export type PaymentRail =
  | 'apple-pay'
  | 'google-pay'
  | 'wallet-balance'
  | 'instant-bank'
  | 'open-banking'
  | 'qr-pay'

export interface WalletSecurityProfile {
  biometricAuth: boolean
  deviceBinding: boolean
  fraudMonitoring: boolean
  encryption: 'AES-256' | 'hardware-backed' | 'secure-enclave'
  securityTier: SecurityTier
  complianceBadges: string[]
}

export interface MobileWalletProvider {
  id: string
  name: string
  platform: MobilePlatform
  categories: WalletCategory[]
  logoAccent: string
  description: string
  supportedCountries: number
  averageOperationTimeMs: number
  supportsEnergyTrading: boolean
  supportsBankLinking: boolean
  supportsNativeDeepLink: boolean
  riskScore: number
  security: WalletSecurityProfile
}

export interface WalletConnection {
  walletId: string
  status: 'connected'
  connectedAt: string
  walletAddress: string
  approvalTimeMs: number
}

export interface PaymentSystem {
  id: PaymentRail
  name: string
  settlementWindow: string
  averageProcessingTimeMs: number
  feesLabel: string
  mobileOptimized: boolean
  supportedWalletIds: string[]
  description: string
}

export interface BankAccountConnection {
  id: string
  bankName: string
  accountLabel: string
  accountType: 'checking' | 'savings' | 'treasury'
  currency: 'USD' | 'EUR' | 'GBP'
  availableBalance: number
  syncStatus: 'synced' | 'syncing'
  lastSyncedAt: string
}

export interface PaymentRequest {
  walletId: string
  paymentRail: PaymentRail
  energyAmountKwh: number
  unitPrice: number
  currency: 'USD'
}

export interface PaymentQuote extends PaymentRequest {
  subtotal: number
  fee: number
  total: number
  estimatedCompletionMs: number
}

export interface PaymentExecution {
  id: string
  quote: PaymentQuote
  status: 'completed'
  processedAt: string
  processingTimeMs: number
  optimizationStepsSaved: number
}

export interface DeviceSyncStatus {
  id: string
  deviceName: string
  platform: MobilePlatform
  lastSyncedAt: string
  syncState: 'healthy' | 'refreshing'
}

export interface WalletSyncSnapshot {
  devices: DeviceSyncStatus[]
  syncCoveragePercent: number
  syncTimeMs: number
  crossDeviceContinuity: boolean
  lastConflictResolvedAt: string
}

export interface WalletAnalyticsSnapshot {
  activeMobileWallets: number
  mobileConversionRate: number
  repeatWalletUsageRate: number
  averagePaymentTimeMs: number
  preferredPaymentRail: PaymentRail
  peakUsageWindow: string
}
