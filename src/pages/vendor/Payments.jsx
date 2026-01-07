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
      const vendorStats = response.data.financial || {}
      
      setStats({
        totalRevenue: vendorStats.totalRevenue || 0,
        totalCommission: vendorStats.totalCommission || 0,
        netEarnings: vendorStats.netRevenue || 0,
        pendingPayouts: 0, // This would come from backend
      })

      // Simulate payment history
      const mockPayments = [
        {
          id: '1',
          orderId: 'ORD-123456',
          amount: 15000,
          commission: 1500,
          netAmount: 13500,
          date: '2024-01-15',
          status: 'PAID',
          paymentMethod: 'MPESA',
        },
        {
          id: '2',
          orderId: 'ORD-123457',
          amount: 8000,
          commission: 800,
          netAmount: 7200,
          date: '2024-01-10',
          status: 'PAID',
          paymentMethod: 'BANK',
        },
        {
          id: '3',
          orderId: 'ORD-123458',
          amount: 25000,
          commission: 2500,
          netAmount: 22500,
          date: '2024-01-05',
          status: 'PENDING',
          paymentMethod: 'MPESA',
        },
      ]
      
      setPayments(mockPayments)
    } catch (error) {
      console.error('Failed to fetch payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Commission</h3>
          <p className="text-2xl font-bold">KES {stats.totalCommission.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Net Earnings</h3>
          <p className="text-2xl font-bold">KES {stats.netEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Payouts</h3>
          <p className="text-2xl font-bold">{stats.pendingPayouts}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Payment History</h3>
        
        {loading ? (
          <div className="text-center py-8">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Commission</th>
                  <th className="text-left py-3">Net Amount</th>
                  <th className="text-left py-3">Method</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">{payment.orderId}</td>
                    <td className="py-4">{payment.date}</td>
                    <td className="py-4">KES {payment.amount.toLocaleString()}</td>
                    <td className="py-4">KES {payment.commission.toLocaleString()}</td>
                    <td className="py-4">KES {payment.netAmount.toLocaleString()}</td>
                    <td className="py-4">{payment.paymentMethod}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        payment.status === 'PAID' 
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

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Payout Information</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Payments are automatically processed to your registered bank/M-Pesa account</li>
              <li>• Commission rate: 10% of each order (varies by category)</li>
              <li>• Payouts are processed within 24-48 hours after order delivery</li>
              <li>• Minimum payout amount: KES 100</li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Need Help?</h4>
            <p className="text-sm text-yellow-700">
              For payment-related inquiries, contact support at payments@eshop.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorPayments