import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Car, 
  Smartphone, 
  Shirt, 
  Home, 
  Dumbbell, 
  Sparkles, 
  Baby, 
  BookOpen,
  Laptop,
  Sofa,
  Watch,
  Gamepad2,
  Plane,
  HeartPulse,
  Music,
  Camera,
  Wrench,
  PawPrint,
  Gem
} from "lucide-react";

const categories = [
  { name: "Cars & Motors", slug: "cars-motors", icon: Car, count: "1,234 items", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  { name: "Electronics", slug: "electronics", icon: Smartphone, count: "3,456 items", color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
  { name: "Fashion", slug: "fashion", icon: Shirt, count: "5,678 items", color: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300" },
  { name: "Home & Garden", slug: "home-garden", icon: Home, count: "2,345 items", color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
  { name: "Sports", slug: "sports", icon: Dumbbell, count: "1,890 items", color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" },
  { name: "Beauty", slug: "beauty", icon: Sparkles, count: "2,123 items", color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { name: "Baby & Kids", slug: "baby-kids", icon: Baby, count: "1,567 items", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300" },
  { name: "Books", slug: "books", icon: BookOpen, count: "4,321 items", color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
  { name: "Computers", slug: "computers", icon: Laptop, count: "2,890 items", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
  { name: "Furniture", slug: "furniture", icon: Sofa, count: "1,234 items", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "Watches", slug: "watches", icon: Watch, count: "890 items", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, count: "1,456 items", color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" },
  { name: "Travel", slug: "travel", icon: Plane, count: "678 items", color: "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" },
  { name: "Health", slug: "health", icon: HeartPulse, count: "1,234 items", color: "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300" },
  { name: "Music", slug: "music", icon: Music, count: "567 items", color: "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300" },
  { name: "Photography", slug: "photography", icon: Camera, count: "345 items", color: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300" },
  { name: "Tools", slug: "tools", icon: Wrench, count: "1,789 items", color: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" },
  { name: "Pets", slug: "pets", icon: PawPrint, count: "890 items", color: "bg-lime-100 text-lime-600 dark:bg-lime-900 dark:text-lime-300" },
  { name: "Jewelry", slug: "jewelry", icon: Gem, count: "456 items", color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900 dark:text-fuchsia-300" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const CategorySection = () => {
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-1">Explore our wide range of products</p>
          </div>
          <Link to="/search" className="flex items-center gap-1 text-primary font-medium hover:underline">
            All Categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                variants={item}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/search?category=${category.slug}`}
                  className="group flex flex-col items-center p-4 rounded-2xl bg-card border border-transparent hover:border-primary/20 hover:shadow-card transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-xs text-center leading-tight">{category.name}</h3>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{category.count}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
