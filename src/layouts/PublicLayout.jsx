import React, { useState, useContext, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Heart, User, Menu, MapPin, ChevronDown, Phone, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useRole } from '../hooks/useRole'

// Button Component
const Button = ({ children, variant = "default", size = "md", className = "", asChild = false, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-700 text-white hover:bg-blue-800",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
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
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
    outline: "text-gray-900 border border-gray-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Main categories for navigation
const mainCategories = [
  { name: "Fruits & Vegetables", slug: "fruits-vegetables" },
  { name: "Breads & Sweets", slug: "breads-sweets" },
  { name: "Frozen Seafoods", slug: "frozen-seafoods" },
  { name: "Raw Meats", slug: "raw-meats" },
  { name: "Wines & Drinks", slug: "wines-drinks" },
  { name: "Coffees & Teas", slug: "coffees-teas" },
  { name: "Milks & Dairies", slug: "milks-dairies" },
  { name: "Pet Foods", slug: "pet-foods" },
];

// Main navigation links
const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/search" },
  { name: "Vendors", path: "/vendors" },
  { name: "Deals", path: "/deals" },
  { name: "About", path: "/about" },
];

// Header Component
const Header = ({ user, isAuthenticated, handleLogout, getDashboardPath }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/search?category=${slug}`);
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Nairobi, Kenya</span>
            </div>
            <span className="hidden md:inline text-blue-200">
              Free delivery on orders over KSh 2,500
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>+254746917511</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">J</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-blue-900">JEIEN</h1>
                  <p className="text-xs text-gray-500">Premium Marketplace</p>
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex relative text-gray-600 hover:text-blue-700"
                onClick={() => handleNavClick('/wishlist')}
              >
                <Heart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white">
                  5
                </Badge>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 hover:text-blue-700"
                onClick={() => handleNavClick('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  0
                </Badge>
              </Button>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-gray-600 hover:text-blue-700"
                      onClick={handleAccountClick}
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-gray-600 hover:text-blue-700"
                      onClick={() => handleNavClick(getDashboardPath())}
                    >
                      <span className="hidden lg:inline">Dashboard</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-600 hover:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-gray-600 hover:text-blue-700"
                    onClick={handleAccountClick}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Button>
                )}
              </div>

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
              <button type="submit" className="sr-only">Search</button>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            {/* Categories Dropdown */}
            <div className="relative group">
              <Button className="gap-2 rounded-none h-12 bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900">
                <Menu className="h-4 w-4" />
                All Categories
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {/* Categories Dropdown Menu */}
              <div className="absolute left-0 top-full w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {mainCategories.map((category) => (
                  <button
                    key={category.slug}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 flex items-center justify-between"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <span>{category.name}</span>
                    <ChevronDown className="h-3 w-3 transform rotate-270" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Main Navigation */}
            <div className="flex items-center">
              {navLinks.map((item) => (
                <Button 
                  key={item.name} 
                  variant="ghost" 
                  className={`rounded-none h-12 px-4 ${
                    location.pathname === item.path 
                      ? 'text-blue-700 border-b-2 border-blue-700' 
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </div>

            {/* Deals Banner */}
            <Button 
              className="ml-auto gap-2 text-sm rounded-full bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900"
              onClick={() => handleNavClick('/deals')}
            >
              🔥 Hot Deals
              <span className="hidden md:inline">Up to 50% off</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-b border-gray-200 md:hidden absolute left-0 right-0 top-full shadow-lg"
        >
          <div className="container mx-auto py-4 px-4 space-y-2">
            {/* Main Navigation in Mobile */}
            {navLinks.map((item) => (
              <button
                key={item.name}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-lg"
                onClick={() => handleNavClick(item.path)}
              >
                {item.name}
              </button>
            ))}
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-500">Categories</h3>
              {mainCategories.map((category) => (
                <button
                  key={category.slug}
                  className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 hover:text-blue-700"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-lg"
                    onClick={handleAccountClick}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-lg"
                    onClick={() => handleNavClick('/cart')}
                  >
                    Cart
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-lg"
                    onClick={() => handleNavClick(getDashboardPath())}
                  >
                    Dashboard
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-lg"
                    onClick={() => handleNavClick('/login')}
                  >
                    Sign In
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-lg"
                    onClick={() => handleNavClick('/register')}
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

// Main PublicLayout Component
const PublicLayout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const { getDashboardPath } = useRole()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
        getDashboardPath={getDashboardPath}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">J</span>
                </div>
                <h3 className="text-lg font-bold">JEIEN</h3>
              </div>
              <p className="text-blue-200">Premium Marketplace</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-blue-200 hover:text-white">Home</Link></li>
                <li><Link to="/search" className="text-blue-200 hover:text-white">Shop</Link></li>
                <li><Link to="/profile" className="text-blue-200 hover:text-white">My Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <p className="text-blue-200">support@jeien.com</p>
              <p className="text-blue-200">+254746917511</p>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300">
            <p>© 2024 JEIEN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout