import settingsService from '../../services/settings.service'

const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commissionRate, setCommissionRate] = useState(7)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
  })

  useEffect(() => {
    fetchPaymentData()
    fetchCommissionSettings()
  }, [])

  const fetchCommissionSettings = async () => {
    try {
      const response = await settingsService.getAdminSettings()
      if (response.success && response.data.settings) {
        setCommissionRate(response.data.settings.defaultCommission || 7)
      }
    } catch (error) {
      console.error('Failed to fetch commission settings:', error)
    }
  }

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      const response = await orderService.getAllOrders()
      const orders = response.data.orders || []

      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalCommission = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0)

      setStats({
        totalRevenue,
        totalCommission,
        totalPayouts: totalRevenue - totalCommission,
        pendingPayouts: orders.filter(o => o.paymentStatus === 'COMPLETED' && o.status !== 'CANCELLED').length,
      })

      // Simulate payment data - in real app, fetch from payments endpoint
      const paymentData = orders
        .filter(order => order.paymentStatus === 'COMPLETED')
        .map(order => ({
          id: order._id,
          orderId: order.orderId,
          vendor: order.vendor?.storeName,
          amount: order.totalAmount,
          commission: order.commissionAmount,
          netAmount: order.totalAmount - (order.commissionAmount || 0),
          paymentMethod: order.paymentMethod,
          paidAt: order.paymentDetails?.paidAt || order.createdAt,
          status: 'PAID',
        }))

      setPayments(paymentData)
    } catch (error) {
      console.error('Failed to fetch payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    try {
      // Create CSV content
      const headers = ['Order ID', 'Vendor', 'Total Amount', 'Commission', 'Net Amount', 'Payment Method', 'Date', 'Status']
      const csvContent = [
        headers.join(','),
        ...payments.map(p => [
          p.orderId,
          p.vendor || 'N/A',
          p.amount,
          p.commission,
          p.netAmount,
          p.paymentMethod,
          new Date(p.paidAt).toLocaleDateString(),
          p.status
        ].join(','))
      ].join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'Report exported successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setMessage({ type: 'error', text: 'Failed to export report' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleUpdateCommission = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })

      const response = await settingsService.updateAdminSettings({
        defaultCommission: commissionRate
      })

      if (response.success) {
        setMessage({ type: 'success', text: `Commission rate updated to ${commissionRate}%` })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        throw new Error(response.message || 'Failed to update commission rate')
      }
    } catch (error) {
      console.error('Failed to update commission:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update commission rate' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Payments & Commissions</h1>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

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
          <h3 className="text-gray-500 text-sm">Vendor Payouts</h3>
          <p className="text-2xl font-bold">KES {stats.totalPayouts.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Payouts</h3>
          <p className="text-2xl font-bold">{stats.pendingPayouts}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Payment History</h3>
          <button
            onClick={handleExportReport}
            disabled={payments.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Export Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Vendor</th>
                  <th className="text-left py-3">Total Amount</th>
                  <th className="text-left py-3">Commission</th>
                  <th className="text-left py-3">Net Amount</th>
                  <th className="text-left py-3">Payment Method</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">{payment.orderId}</td>
                    <td className="py-4">{payment.vendor}</td>
                    <td className="py-4">KES {payment.amount}</td>
                    <td className="py-4">KES {payment.commission}</td>
                    <td className="py-4">KES {payment.netAmount}</td>
                    <td className="py-4">{payment.paymentMethod}</td>
                    <td className="py-4">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${payment.status === 'PAID'
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
        <h3 className="text-lg font-bold mb-4">Commission Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Default Commission Rate (%)
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              min="0"
              max="50"
              step="0.1"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleUpdateCommission}
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {saving ? 'Updating...' : 'Update Commission Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPayments