import React, { useState, useEffect } from 'react'
import vendorService from '../../services/vendor.service'

const VendorPayments = () => {
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    netEarnings: 0,
    pendingPayouts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      const response = await vendorService.getVendorStats()
      const vendorStats = response.data.financial || response.data.overview || {}

      const totalRevenue = vendorStats.totalRevenue || 0
      const commissionRate = 7
      const totalCommission = parseFloat((totalRevenue * (commissionRate / 100)).toFixed(2))
      const netEarnings = parseFloat((totalRevenue - totalCommission).toFixed(2))

      setStats({
        totalRevenue,
        totalCommission,
        netEarnings,
        pendingPayouts: 0,
      })

      // Simulate payment history with commission breakdown
      const mockPayments = [
        {
          id: '1',
          orderId: 'ORD-123456',
          amount: 15000,
          commission: 1050,
          netAmount: 13950,
          date: '2024-01-15',
          status: 'PAID',
          paymentMethod: 'MPESA',
        },
        {
          id: '2',
          orderId: 'ORD-123457',
          amount: 8000,
          commission: 560,
          netAmount: 7440,
          date: '2024-01-10',
          status: 'PAID',
          paymentMethod: 'BANK',
        },
        {
          id: '3',
          orderId: 'ORD-123458',
          amount: 25000,
          commission: 1750,
          netAmount: 23250,
          date: '2024-01-05',
          status: 'PENDING',
          paymentMethod: 'MPESA',
        },
      ]

      setPayments(mockPayments)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payments & Earnings</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-75">100% of sales</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Platform Fee (7%)</h3>
          <p className="text-3xl font-bold">KES {stats.totalCommission.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-75">Admin commission</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Your Net Earnings</h3>
          <p className="text-3xl font-bold">KES {stats.netEarnings.toLocaleString()}</p>
          <p className="text-xs mt-2 opacity-75">93% after commission</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Pending Payouts</h3>
          <p className="text-3xl font-bold">{stats.pendingPayouts}</p>
          <p className="text-xs mt-2 opacity-75">Awaiting processing</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-bold mb-6 text-gray-900">Payment History</h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading payments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Commission (7%)</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Your Payout (93%)</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Method</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{payment.orderId}</td>
                    <td className="py-4 px-4 text-gray-600">{payment.date}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">KES {payment.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-red-600 font-medium">- KES {payment.commission.toLocaleString()}</td>
                    <td className="py-4 px-4 text-green-600 font-bold">KES {payment.netAmount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Information */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Payout Information</h3>
        <div className="space-y-4">
          <div className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How Payouts Work
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Payments are automatically processed to your registered M-Pesa account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Commission rate: 7%</strong> of each order goes to platform fees</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>You receive: 93%</strong> of each order directly to your phone</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Payouts are processed within 24-48 hours after order delivery</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Minimum payout amount: KES 100</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Commission Breakdown Example
            </h4>
            <div className="text-sm text-green-800 bg-white p-4 rounded-lg mt-2">
              <p className="mb-2">If a customer pays <strong>KES 10,000</strong> for your product:</p>
              <div className="space-y-1 ml-4">
                <p>• Platform fee (7%): <strong className="text-red-600">KES 700</strong></p>
                <p>• Your payout (93%): <strong className="text-green-600">KES 9,300</strong></p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </h4>
            <p className="text-sm text-yellow-800">
              For payment-related inquiries or issues with payouts, contact support at <strong>caprufru@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorPayments