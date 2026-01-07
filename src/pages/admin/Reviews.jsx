import React, { useState, useEffect } from 'react'
import reviewService from '../../services/review.service'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [statusFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      
      const response = await reviewService.getAllReviews(params)
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (reviewId, status) => {
    try {
      await reviewService.moderateReview(reviewId, { status })
      fetchReviews()
    } catch (error) {
      console.error('Failed to moderate review:', error)
    }
  }

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewService.deleteReview(reviewId)
        fetchReviews()
      } catch (error) {
        console.error('Failed to delete review:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reviews Moderation</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="HIDDEN">Hidden</option>
          </select>
          <div className="text-sm text-gray-500">
            Total: {reviews.length} reviews
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    {review.buyer?.profileImage ? (
                      <img
                        src={review.buyer.profileImage}
                        alt={review.buyer.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        👤
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{review.buyer?.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">Rating: {review.rating}/5</span>
                        {review.verifiedPurchase && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      review.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      review.status === 'HIDDEN' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="font-medium mb-1">{review.title}</p>
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="flex space-x-2 mb-3">
                    {review.images.slice(0, 3).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Review ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                {review.reply && (
                  <div className="bg-blue-50 p-3 rounded mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-blue-800">Vendor Reply</p>
                      <p className="text-sm text-blue-600">
                        {new Date(review.reply.repliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-blue-700">{review.reply.comment}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Product: {review.product?.title}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={review.status}
                      onChange={(e) => handleModeration(review._id, e.target.value)}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approve</option>
                      <option value="REJECTED">Reject</option>
                      <option value="HIDDEN">Hide</option>
                    </select>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReviews