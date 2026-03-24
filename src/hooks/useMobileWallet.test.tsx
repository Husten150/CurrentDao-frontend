import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { useMobileWallet } from '@/hooks/useMobileWallet'
import { mobileWalletService } from '@/services/mobile/mobile-wallet-service'
import { paymentService } from '@/services/mobile/payment-service'
import {
  BankAccountConnection,
  MobileWalletProvider,
  PaymentSystem,
  WalletAnalyticsSnapshot,
  WalletConnection,
  WalletSyncSnapshot,
} from '@/types/mobile-wallet'

jest.mock('@/services/mobile/mobile-wallet-service', () => ({
  mobileWalletService: {
    listWallets: jest.fn(),
    connectWallet: jest.fn(),
    getWalletSyncSnapshot: jest.fn(),
    getWalletAnalytics: jest.fn(),
  },
}))

jest.mock('@/services/mobile/payment-service', () => ({
  paymentService: {
    listPaymentSystems: jest.fn(),
    listBankAccounts: jest.fn(),
    syncBankAccounts: jest.fn(),
    createPaymentQuote: jest.fn(),
    processPayment: jest.fn(),
  },
}))

type HookSnapshot = ReturnType<typeof useMobileWallet>

const mockedMobileWalletService = mobileWalletService as jest.Mocked<typeof mobileWalletService>
const mockedPaymentService = paymentService as jest.Mocked<typeof paymentService>

const walletsFixture: MobileWalletProvider[] = [
  {
    id: 'apple-wallet',
    name: 'Apple Wallet',
    platform: 'ios',
    categories: ['native'],
    logoAccent: 'from-slate-900 to-slate-700',
    description: 'Native wallet',
    supportedCountries: 68,
    averageOperationTimeMs: 420,
    supportsEnergyTrading: true,
    supportsBankLinking: true,
    supportsNativeDeepLink: true,
    riskScore: 95,
    security: {
      biometricAuth: true,
      deviceBinding: true,
      fraudMonitoring: true,
      encryption: 'secure-enclave',
      securityTier: 'institutional',
      complianceBadges: ['PCI DSS'],
    },
  },
  {
    id: 'phantom',
    name: 'Phantom',
    platform: 'cross-platform',
    categories: ['defi', 'energy'],
    logoAccent: 'from-fuchsia-500 to-indigo-500',
    description: 'Energy wallet',
    supportedCountries: 90,
    averageOperationTimeMs: 500,
    supportsEnergyTrading: true,
    supportsBankLinking: false,
    supportsNativeDeepLink: true,
    riskScore: 85,
    security: {
      biometricAuth: true,
      deviceBinding: true,
      fraudMonitoring: true,
      encryption: 'AES-256',
      securityTier: 'enhanced',
      complianceBadges: ['Biometric MFA'],
    },
  },
]

const systemsFixture: PaymentSystem[] = [
  {
    id: 'instant-bank',
    name: 'Instant Bank',
    settlementWindow: '2 to 4 seconds',
    averageProcessingTimeMs: 2800,
    feesLabel: '0.4%',
    mobileOptimized: true,
    supportedWalletIds: ['apple-wallet'],
    description: 'Bank payment',
  },
  {
    id: 'wallet-balance',
    name: 'Wallet Balance',
    settlementWindow: 'Under 2 seconds',
    averageProcessingTimeMs: 950,
    feesLabel: '0.25%',
    mobileOptimized: true,
    supportedWalletIds: ['phantom', 'apple-wallet'],
    description: 'Stored balance',
  },
]

const accountsFixture: BankAccountConnection[] = [
  {
    id: 'bank-1',
    bankName: 'Monzo',
    accountLabel: 'Operating Balance',
    accountType: 'checking',
    currency: 'USD',
    availableBalance: 1000,
    syncStatus: 'synced',
    lastSyncedAt: '2026-03-24T09:33:00.000Z',
  },
]

const syncFixture: WalletSyncSnapshot = {
  devices: [
    {
      id: 'device-1',
      deviceName: 'iPhone 15 Pro',
      platform: 'ios',
      lastSyncedAt: '2026-03-24T09:32:00.000Z',
      syncState: 'healthy',
    },
  ],
  syncCoveragePercent: 99,
  syncTimeMs: 640,
  crossDeviceContinuity: true,
  lastConflictResolvedAt: '2026-03-24T09:15:00.000Z',
}

const analyticsFixture: WalletAnalyticsSnapshot = {
  activeMobileWallets: 12,
  mobileConversionRate: 0.78,
  repeatWalletUsageRate: 0.64,
  averagePaymentTimeMs: 2800,
  preferredPaymentRail: 'instant-bank',
  peakUsageWindow: '6:00 PM - 9:00 PM',
}

const connectionFixture: WalletConnection = {
  walletId: 'phantom',
  status: 'connected',
  connectedAt: '2026-03-24T11:00:00.000Z',
  walletAddress: 'CUR-PHANTOM-A91X',
  approvalTimeMs: 420,
}

function renderHarness() {
  const container = document.createElement('div')
  const root = createRoot(container)
  let latest: HookSnapshot | null = null

  function Harness() {
    const hook = useMobileWallet()

    useEffect(() => {
      latest = hook
    })

    return null
  }

  return {
    root,
    async mount() {
      await act(async () => {
        root.render(<Harness />)
      })
    },
    latest() {
      return latest
    },
    async flush() {
      await act(async () => {
        await Promise.resolve()
      })
    },
    async unmount() {
      await act(async () => {
        root.unmount()
      })
    },
  }
}

describe('useMobileWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockedMobileWalletService.listWallets.mockResolvedValue(walletsFixture)
    mockedMobileWalletService.connectWallet.mockResolvedValue(connectionFixture)
    mockedMobileWalletService.getWalletSyncSnapshot.mockResolvedValue(syncFixture)
    mockedMobileWalletService.getWalletAnalytics.mockResolvedValue(analyticsFixture)

    mockedPaymentService.listPaymentSystems.mockResolvedValue(systemsFixture)
    mockedPaymentService.listBankAccounts.mockResolvedValue(accountsFixture)
    mockedPaymentService.syncBankAccounts.mockResolvedValue(accountsFixture)
    mockedPaymentService.createPaymentQuote.mockResolvedValue({
      walletId: 'phantom',
      paymentRail: 'wallet-balance',
      energyAmountKwh: 90,
      unitPrice: 0.1,
      currency: 'USD',
      subtotal: 9,
      fee: 0.02,
      total: 9.02,
      estimatedCompletionMs: 950,
    })
    mockedPaymentService.processPayment.mockResolvedValue({
      id: 'pay_123',
      quote: {
        walletId: 'phantom',
        paymentRail: 'wallet-balance',
        energyAmountKwh: 90,
        unitPrice: 0.1,
        currency: 'USD',
        subtotal: 9,
        fee: 0.02,
        total: 9.02,
        estimatedCompletionMs: 950,
      },
      status: 'completed',
      processedAt: '2026-03-24T11:01:00.000Z',
      processingTimeMs: 950,
      optimizationStepsSaved: 3,
    })
  })

  it('loads wallet data, remaps incompatible rails, and completes the happy path', async () => {
    const harness = renderHarness()
    await harness.mount()
    await harness.flush()

    expect(harness.latest()?.supportedWalletCount).toBe(2)
    expect(harness.latest()?.selectedWalletId).toBe('apple-wallet')
    expect(harness.latest()?.selectedPaymentRail).toBe('instant-bank')

    await act(async () => {
      harness.latest()?.setSelectedWalletId('phantom')
    })
    await harness.flush()

    expect(harness.latest()?.selectedPaymentRail).toBe('wallet-balance')

    await act(async () => {
      await harness.latest()?.connectSelectedWallet()
    })

    expect(harness.latest()?.connection?.status).toBe('connected')

    await act(async () => {
      await harness.latest()?.runPayment({
        energyAmountKwh: 90,
        unitPrice: 0.1,
      })
    })

    expect(harness.latest()?.lastTransaction?.status).toBe('completed')

    await act(async () => {
      await harness.latest()?.refreshSync()
    })

    expect(harness.latest()?.syncSnapshot?.crossDeviceContinuity).toBe(true)
    expect(harness.latest()?.bankAccounts).toEqual(accountsFixture)

    await harness.unmount()
  })

  it('surfaces loading and action errors', async () => {
    mockedMobileWalletService.listWallets.mockRejectedValueOnce(new Error('load failed'))

    const harness = renderHarness()
    await harness.mount()
    await harness.flush()

    expect(harness.latest()?.error).toBe('Unable to load mobile wallet integrations.')
    expect(harness.latest()?.isLoading).toBe(false)
    expect(await harness.latest()?.connectSelectedWallet()).toBeNull()

    await act(async () => {
      expect(
        await harness.latest()?.runPayment({ energyAmountKwh: 10, unitPrice: 0.1 }),
      ).toBeNull()
    })

    expect(harness.latest()?.error).toBe('Select a wallet before starting payment.')

    await harness.unmount()
  })

  it('handles downstream service failures after a successful load', async () => {
    mockedMobileWalletService.connectWallet.mockRejectedValueOnce(new Error('connect failed'))
    mockedPaymentService.syncBankAccounts.mockRejectedValueOnce(new Error('sync failed'))
    mockedPaymentService.createPaymentQuote.mockRejectedValueOnce(new Error('quote failed'))

    const harness = renderHarness()
    await harness.mount()
    await harness.flush()

    await act(async () => {
      await harness.latest()?.connectSelectedWallet()
    })
    expect(harness.latest()?.error).toBe('Unable to connect the selected wallet.')

    await act(async () => {
      await harness.latest()?.refreshSync()
    })
    expect(harness.latest()?.error).toBe('Sync refresh failed.')

    await act(async () => {
      await harness.latest()?.runPayment({ energyAmountKwh: 10, unitPrice: 0.1 })
    })
    expect(harness.latest()?.error).toBe('Payment processing failed.')
    expect(harness.latest()?.isProcessingPayment).toBe(false)

    await harness.unmount()
  })
})
