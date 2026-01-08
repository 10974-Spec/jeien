import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, MapPin, ChevronDown, Phone, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";

// Button Component
const Button = ({ children, variant = "default", size = "md", className = "", asChild = false, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-700 text-white hover:bg-blue-800",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    link: "text-blue-700 underline-offset-4 hover:underline",
  };
  const sizes = {
    sm: "h-9 px-3 rounded-md text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  const Comp = asChild ? "a" : "button";

  return (
    <Comp
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
};

// Input Component
const Input = ({ className, type = "text", ...props }) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gradient-to-r from-blue-700 to-blue-800 text-white",
    secondary: "bg-gray-200 text-gray-800",
    destructive: "bg-red-500 text-white",
    outline: "text-gray-800 border border-gray-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const categories = [
  { name: "Fruits & Vegetables", path: "/category/fruits-vegetables" },
  { name: "Breads & Sweets", path: "/category/breads-sweets" },
  { name: "Frozen Seafoods", path: "/category/seafood" },
  { name: "Raw Meats", path: "/category/meat" },
  { name: "Wines & Drinks", path: "/category/drinks" },
  { name: "Coffees & Teas", path: "/category/coffee-tea" },
  { name: "Milks & Dairies", path: "/category/dairy" },
  { name: "Pet Foods", path: "/category/pet-food" },
];

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/search" },
  { name: "Vendors", path: "/vendors" },
  { name: "Deals", path: "/search?deals=true" },
  { name: "Categories", path: "/categories" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, getTotalItems } = useCart();
  const { wishlist, getWishlistCount } = useWishlist();

  const cartCount = getTotalItems();
  const wishlistCount = getWishlistCount();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    } else {
      navigate("/login");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Reset search when navigating
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    } else {
      setSearchQuery("");
    }
  }, [location]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 px-4 hidden md:block">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Nairobi, Kenya</span>
            </div>
            <span className="text-blue-200">
              Free delivery on orders over KSh 2,500
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>+254746917511</span>
            </div>
            {isAuthenticated ? (
              <span className="text-blue-200">Welcome, {user?.name?.split(' ')[0] || 'User'}!</span>
            ) : (
              <Link to="/login" className="text-blue-300 hover:text-blue-200 transition-colors">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">J</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-blue-900">JEIEN</h1>
                  <p className="text-xs text-gray-500">Premium • Quality • Trusted</p>
                </div>
              </motion.div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
              <div className="relative flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search for products, brands and more..."
                    className="pl-11 pr-4 h-12 rounded-l-xl rounded-r-none border-r-0 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-12 px-6 rounded-l-none rounded-r-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white">
                  Search
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Wishlist Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hidden sm:flex"
                asChild
              >
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="h-5 w-5 text-gray-600" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              
              {/* Cart Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                asChild
              >
                <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Account Button with Dropdown */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 relative profile-menu">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-gray-600 hover:text-blue-700"
                  onClick={handleProfileClick}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Account</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            My Profile
                          </Link>
                          <Link 
                            to="/orders" 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            My Orders
                          </Link>
                          {user?.role === 'vendor' && (
                            <Link 
                              to="/vendor" 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              🛒 Vendor Dashboard
                            </Link>
                          )}
                          {user?.role === 'admin' && (
                            <Link 
                              to="/admin" 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              👑 Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-3">Sign in to access your account</p>
                        <div className="space-y-2">
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900" 
                            size="sm"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              navigate("/login");
                            }}
                          >
                            Sign In
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full border-blue-700 text-blue-700 hover:bg-blue-50" 
                            size="sm"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              navigate("/register");
                            }}
                          >
                            Register
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-gray-600 hover:text-blue-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search products..."
                className="pl-11 h-11 rounded-xl bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            <Button className="gap-2 rounded-none h-12 bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900" asChild>
              <Link to="/categories">
                <Menu className="h-4 w-4" />
                All Categories
                <ChevronDown className="h-4 w-4" />
              </Link>
            </Button>
            
            <div className="flex items-center">
              {navLinks.map((item) => (
                <Button 
                  key={item.name} 
                  variant="ghost" 
                  className={`rounded-none h-12 px-4 ${location.pathname === item.path ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-blue-700'}`} 
                  asChild
                >
                  <Link to={item.path}>{item.name}</Link>
                </Button>
              ))}
            </div>

            <Link to="/search?deals=true" className="ml-auto flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
              <Badge className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                🔥 Hot Deals
              </Badge>
              <span className="text-gray-500">Up to 50% off on selected items</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-b border-gray-200 md:hidden overflow-hidden"
        >
          <div className="container mx-auto py-4 px-4 space-y-2">
            {/* Navigation Links */}
            {navLinks.map((item) => (
              <Button 
                key={item.name} 
                variant="ghost" 
                className="w-full justify-start text-gray-600 hover:text-blue-700" 
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to={item.path}>{item.name}</Link>
              </Button>
            ))}

            {/* Categories */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2 px-3">Categories</p>
              {categories.map((cat) => (
                <Button 
                  key={cat.name} 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:text-blue-700 text-sm" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to={cat.path}>{cat.name}</Link>
                </Button>
              ))}
            </div>

            {/* User Section */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-blue-700" 
                    asChild 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/profile">My Profile</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-blue-700" 
                    asChild 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/orders">My Orders</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-blue-700" 
                    asChild 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/wishlist">
                      My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                  </Button>
                  {user?.role === 'vendor' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-600 hover:text-blue-700" 
                      asChild 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link to="/vendor">Vendor Dashboard</Link>
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-600 hover:text-blue-700" 
                      asChild 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link to="/admin">Admin Panel</Link>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-blue-700" 
                    asChild 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-blue-700" 
                    asChild 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};