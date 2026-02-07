import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Store, Mail, Phone, MapPin, Calendar,
    Package, DollarSign, TrendingUp, CheckCircle, XCircle,
    Edit, Eye, Loader2
} from 'lucide-react'
import vendorService from '../../services/vendor.service'
import productService from '../../services/product.service'

const VendorDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [vendor, setVendor] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [productsLoading, setProductsLoading] = useState(true)

    useEffect(() => {
        fetchVendorDetails()
        fetchVendorProducts()
    }, [id])

    const fetchVendorDetails = async () => {
        try {
            setLoading(true)
            const response = await vendorService.getVendorById(id)
            setVendor(response.data.vendor || response.data)
        } catch (error) {
            console.error('Failed to fetch vendor details:', error)
            alert('Failed to load vendor details')
        } finally {
            setLoading(false)
        }
    }

    const fetchVendorProducts = async () => {
        try {
            setProductsLoading(true)
            const response = await productService.getAllProducts({ vendor: id })
            setProducts(response.data.products || [])
        } catch (error) {
            console.error('Failed to fetch vendor products:', error)
        } finally {
            setProductsLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            </div>
        )
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
                <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
                <Link to="/admin/vendors" className="text-blue-700 hover:text-blue-800">
                    Back to Vendors
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/vendors')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Vendors
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{vendor.storeName || 'Vendor Details'}</h1>
                        <p className="text-gray-600 mt-1">Vendor ID: {vendor._id}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg font-medium ${vendor.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {vendor.status === 'active' ? (
                                <><CheckCircle className="h-4 w-4 inline mr-2" />Active</>
                            ) : (
                                <><XCircle className="h-4 w-4 inline mr-2" />Inactive</>
                            )}
                        </span>

                        {vendor.verified && (
                            <span className="px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="h-4 w-4 inline mr-2" />
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Sales</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                KSh {(vendor.totalSales || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{vendor.totalOrders || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Commission Rate</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{vendor.commissionRate || 10}%</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendor Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Store Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Store Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Store Name</p>
                            <p className="text-base font-medium text-gray-900">{vendor.storeName || 'N/A'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="text-base text-gray-900">{vendor.description || 'No description provided'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">Business Type</p>
                            <p className="text-base font-medium text-gray-900">{vendor.businessType || 'N/A'}</p>
                        </div>

                        {vendor.logo && (
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Store Logo</p>
                                <img
                                    src={vendor.logo}
                                    alt={vendor.storeName}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-base font-medium text-gray-900">{vendor.email || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="text-base font-medium text-gray-900">{vendor.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="text-base text-gray-900">
                                    {vendor.address?.street || 'N/A'}<br />
                                    {vendor.address?.city && `${vendor.address.city}, `}
                                    {vendor.address?.state && `${vendor.address.state} `}
                                    {vendor.address?.zipCode}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="text-base font-medium text-gray-900">
                                    {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Products ({products.length})</h2>

                {productsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No products found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {product.images?.[0] && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.title}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900">{product.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">{product.category?.name || 'N/A'}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">
                                            KSh {product.price?.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`${product.stock > 10 ? 'text-green-600' :
                                                    product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {product.stock || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${product.published
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/admin/products/edit/${product._id}`}
                                                className="text-blue-700 hover:text-blue-800 text-sm font-medium"
                                            >
                                                <Eye className="h-4 w-4 inline mr-1" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VendorDetails
