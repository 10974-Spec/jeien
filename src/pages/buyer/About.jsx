import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Store, Users, Target, Globe, Shield, Truck,
  Award, Heart, Sparkles, CheckCircle, TrendingUp,
  Zap, Clock, Gift, Star, MapPin, Phone, Mail,
  Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react'

const AboutPage = () => {
  const stats = [
    { icon: Store, label: 'Vendors', value: '10,000+', description: 'Trusted sellers' },
    { icon: Users, label: 'Customers', value: '2M+', description: 'Happy shoppers' },
    { icon: Target, label: 'Products', value: '500K+', description: 'Quality items' },
    { icon: Globe, label: 'Coverage', value: 'Nationwide', description: 'Kenya-wide delivery' },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your data and payments are protected with bank-level security',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Nationwide delivery with real-time tracking',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'Verified products with money-back guarantee',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Heart,
      title: 'Customer Love',
      description: '24/7 support and hassle-free returns',
      color: 'bg-red-100 text-red-600'
    },
  ]

  const values = [
    {
      title: 'Transparency',
      description: 'Clear pricing, honest reviews, and open communication with all our stakeholders.',
      icon: Sparkles
    },
    {
      title: 'Innovation',
      description: 'Constantly improving our platform to provide the best shopping experience.',
      icon: Zap
    },
    {
      title: 'Community',
      description: 'Supporting local businesses and building a thriving ecosystem.',
      icon: Users
    },
    {
      title: 'Excellence',
      description: 'Striving for excellence in every product, service, and interaction.',
      icon: Star
    },
  ]

  const milestones = [
    { year: '2020', event: 'Founded in Nairobi, Kenya', description: 'Started with a vision to connect local vendors with customers nationwide' },
    { year: '2021', event: 'Reached 1,000 vendors', description: 'Expanded our vendor network across major cities' },
    { year: '2022', event: 'Launched mobile app', description: 'Enhanced shopping experience with dedicated mobile application' },
    { year: '2023', event: '2 million customers', description: 'Achieved major milestone in customer base growth' },
    { year: '2024', event: 'Nationwide delivery', description: 'Expanded delivery network to cover all counties' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/5" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-6"
            >
              <Store className="h-4 w-4" />
              About JEIEN
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Connecting <span className="text-blue-600">Vendors</span> with{' '}
              <span className="text-blue-600">Customers</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              Kenya's premier marketplace platform, empowering thousands of businesses
              and serving millions of customers with quality products and seamless shopping experiences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                to="/register?vendor=true"
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
              >
                Become a Vendor
              </Link>
              <Link
                to="/shop"
                className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
              >
                Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 lg:p-8 text-center border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="font-medium text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose JEIEN?
            </h2>
            <p className="text-lg text-gray-600">
              We're committed to providing the best shopping experience for both customers and vendors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-blue-100/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 lg:gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-white border border-blue-200 flex items-center justify-center">
                    <value.icon className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              From a small startup to Kenya's leading marketplace
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-lg" />

                  {/* Content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm font-medium text-blue-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {milestone.event}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              We'd love to hear from you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                Nairobi, Kenya
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">
                +254746917511
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">
                caprufru@gmail.com
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Join the JEIEN Community
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-blue-100 mb-8"
            >
              Whether you're looking to shop or sell, we've got you covered
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register?vendor=true"
                className="px-8 py-3 bg-white text-blue-900 rounded-full font-bold hover:bg-blue-50 transition-all transform hover:-translate-y-0.5"
              >
                Start Selling
              </Link>
              <Link
                to="/shop"
                className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-full font-bold hover:bg-white/10 transition-all transform hover:-translate-y-0.5"
              >
                Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage