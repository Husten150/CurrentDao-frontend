'use client'

import { useEffect, useState } from 'react'
import { mobileWalletService } from '@/services/mobile/mobile-wallet-service'
import { paymentService } from '@/services/mobile/payment-service'
import {
  BankAccountConnection,
  MobileWalletProvider,
  PaymentExecution,
  PaymentRail,
  PaymentSystem,
  WalletAnalyticsSnapshot,
  WalletConnection,
  WalletSyncSnapshot,
} from '@/types/mobile-wallet'

interface PaymentDraft {
  energyAmountKwh: number
  unitPrice: number
}

export function useMobileWallet() {
  const [wallets, setWallets] = useState<MobileWalletProvider[]>([])
  const [paymentSystems, setPaymentSystems] = useState<PaymentSystem[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccountConnection[]>([])
  const [syncSnapshot, setSyncSnapshot] = useState<WalletSyncSnapshot | null>(null)
  const [analytics, setAnalytics] = useState<WalletAnalyticsSnapshot | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [selectedPaymentRail, setSelectedPaymentRail] = useState<PaymentRail>('instant-bank')
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [lastTransaction, setLastTransaction] = useState<PaymentExecution | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    let isActive = true

    async function load() {
      try {
        const [walletData, systemData, bankData, syncData, analyticsData] = await Promise.all([
          mobileWalletService.listWallets(),
          paymentService.listPaymentSystems(),
          paymentService.listBankAccounts(),
          mobileWalletService.getWalletSyncSnapshot(),
          mobileWalletService.getWalletAnalytics(),
        ])

        if (!isActive) {
          return
        }

        setWallets(walletData)
        setPaymentSystems(systemData)
        setBankAccounts(bankData)
        setSyncSnapshot(syncData)
        setAnalytics(analyticsData)
        setSelectedWalletId(walletData[0]?.id ?? '')
        setSelectedPaymentRail(
          systemData.find((system) => system.id === 'instant-bank')?.id ??
            systemData[0]?.id ??
            'instant-bank',
        )
      } catch {
        if (isActive) {
          setError('Unable to load mobile wallet integrations.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isActive = false
    }
  }, [])

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId) ?? null
  const compatiblePaymentSystems = paymentSystems.filter((system) =>
    selectedWallet ? system.supportedWalletIds.includes(selectedWallet.id) : true,
  )

  useEffect(() => {
    if (!compatiblePaymentSystems.length) {
      return
    }

    const selectedRailStillSupported = compatiblePaymentSystems.some(
      (system) => system.id === selectedPaymentRail,
    )

    if (!selectedRailStillSupported) {
      setSelectedPaymentRail(compatiblePaymentSystems[0].id)
    }
  }, [compatiblePaymentSystems, selectedPaymentRail])

  async function connectSelectedWallet() {
    if (!selectedWalletId) {
      return null
    }

    setError(null)

    try {
      const result = await mobileWalletService.connectWallet(selectedWalletId)
      setConnection(result)
      return result
    } catch {
      setError('Unable to connect the selected wallet.')
      return null
    }
  }

  async function refreshSync() {
    setError(null)

    try {
      const [nextSync, nextBanks] = await Promise.all([
        mobileWalletService.getWalletSyncSnapshot(),
        paymentService.syncBankAccounts(),
      ])
      setSyncSnapshot(nextSync)
      setBankAccounts(nextBanks)
    } catch {
      setError('Sync refresh failed.')
    }
  }

  async function runPayment(draft: PaymentDraft) {
    if (!selectedWalletId) {
      setError('Select a wallet before starting payment.')
      return null
    }

    setError(null)
    setIsProcessingPayment(true)

    try {
      const quote = await paymentService.createPaymentQuote({
        walletId: selectedWalletId,
        paymentRail: selectedPaymentRail,
        energyAmountKwh: draft.energyAmountKwh,
        unitPrice: draft.unitPrice,
        currency: 'USD',
      })

      const execution = await paymentService.processPayment(quote)
      setLastTransaction(execution)

      return execution
    } catch {
      setError('Payment processing failed.')
      return null
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return {
    wallets,
    paymentSystems,
    compatiblePaymentSystems,
    bankAccounts,
    syncSnapshot,
    analytics,
    selectedWallet,
    selectedWalletId,
    selectedPaymentRail,
    connection,
    lastTransaction,
    error,
    isLoading,
    isProcessingPayment,
    setSelectedWalletId,
    setSelectedPaymentRail,
    connectSelectedWallet,
    refreshSync,
    runPayment,
    supportedWalletCount: wallets.length,
  }
}
