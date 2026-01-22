import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#722F37] to-[#8B3A3A] text-white mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg 
                className="w-10 h-10 text-[#D4AF37]" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M6.5 2C5.67 2 5 2.67 5 3.5V4.5C5 4.78 5.11 5.04 5.29 5.24L9 9.5V18H7C6.45 18 6 18.45 6 19C6 19.55 6.45 20 7 20H17C17.55 20 18 19.55 18 19C18 18.45 17.55 18 17 18H15V9.5L18.71 5.24C18.89 5.04 19 4.78 19 4.5V3.5C19 2.67 18.33 2 17.5 2H6.5M7 4H17V4.5L13 9V18H11V9L7 4.5V4Z" />
              </svg>
              <div>
                <h3 className="text-2xl font-bold font-serif">CBR Wine Hunter</h3>
                <p className="text-sm text-[#D4AF37]">Canberra Region</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed max-w-md">
              Your comprehensive guide to discovering exceptional wines from the Canberra wine region. 
              Explore wines from 40+ local wineries, all in one place.
            </p>
            <div className="mt-6 flex gap-4">
              <a 
                href="https://github.com/buzzmooau/CBRWineHunter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-[#D4AF37] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-[#D4AF37]">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-[#D4AF37] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/wines" className="text-sm hover:text-[#D4AF37] transition-colors">
                  Browse Wines
                </Link>
              </li>
              <li>
                <Link to="/wineries" className="text-sm hover:text-[#D4AF37] transition-colors">
                  Wineries
                </Link>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-[#D4AF37]">About</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                500+ Wines Listed
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                40+ Wineries
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Updated Daily
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Canberra Region
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-80 text-center md:text-left">
              © {currentYear} CBR Wine Hunter. Built with ❤️ for the Canberra wine community.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-[#D4AF37] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
