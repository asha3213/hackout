import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Zap, 
  Home, 
  Factory, 
  ShoppingCart, 
  Shield, 
  Database,
  Eye,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Admin', href: '/admin', icon: Database },
  { name: 'Verifier', href: '/verifier', icon: Eye },
  { name: 'Producer', href: '/producer', icon: Factory },
  { name: 'Market', href: '/market', icon: ShoppingCart },
];

export default function Layout({ children }: LayoutProps) {
  const { currentAccount, setCurrentAccount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setCurrentAccount(null);
  };

  if (!currentAccount) {
    return null; // AccountSelector will handle this
  }

  return (
    <>
      {/* Header */}
      <header className="glass-effect border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-energy-500 to-hydrogen-500 rounded-full flex items-center justify-center energy-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient">
                HydroCredit
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "text-energy-400 bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Account Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {currentAccount.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {currentAccount.role}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === item.href
                        ? "text-energy-400 bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full mt-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </>
  );
}