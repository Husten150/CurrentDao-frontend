import { mobileWalletService } from '@/services/mobile/mobile-wallet-service'

describe('mobileWalletService', () => {
  it('returns a catalog with at least 10 mobile wallets', async () => {
    const wallets = await mobileWalletService.listWallets()

    expect(wallets).toHaveLength(12)
    expect(wallets.every((wallet) => wallet.supportsNativeDeepLink)).toBe(true)
  })

  it('connects a wallet with sub-second approval timing', async () => {
    const connection = await mobileWalletService.connectWallet('apple-wallet')

    expect(connection.status).toBe('connected')
    expect(connection.walletAddress).toContain('CUR-')
    expect(connection.approvalTimeMs).toBeLessThan(1000)
  })

  it('returns cross-device sync metrics under one second', async () => {
    const sync = await mobileWalletService.getWalletSyncSnapshot()

    expect(sync.crossDeviceContinuity).toBe(true)
    expect(sync.devices.length).toBeGreaterThanOrEqual(3)
    expect(sync.syncTimeMs).toBeLessThan(1000)
  })
})
