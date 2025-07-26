import { useState, useRef, useEffect } from 'react';
import { IoMenu, IoClose } from "react-icons/io5";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useProfileSidebar } from '../context/ProfileSidebarContext.jsx';

export default function Navbar() {
    const defaultProfile = "https://imgs.search.brave.com/XfEYZ8GiGdxGCdS_JsblVMJV7ufqdKMwU1a9uPFGtjg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNS9Qcm9m/aWxlLVBORy1GcmVl/LUltYWdlLnBuZw";
    
    const [isOpen, setIsOpen] = useState(false);
    const [imgUrl, setImgUrl] = useState(defaultProfile); 
    const menuref = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { openProfileSidebar } = useProfileSidebar();

    useEffect(() => {
        const stored = localStorage.getItem("profileImg");
        if (stored && stored.trim() !== "") {
            // Check if the stored URL is a complete URL or just a filename
            const processedUrl = stored.startsWith('http') 
                ? stored 
                : `http://localhost:3001/uploads/profiles/${stored}`;
            setImgUrl(processedUrl);
        }
        // If no stored image, keep the default profile that was already set in state
    }, []);

    // Listen for profile image updates
    useEffect(() => {
        const handleProfileUpdate = () => {
            const stored = localStorage.getItem("profileImg");
            if (stored && stored.trim() !== "") {
                // Check if the stored URL is a complete URL or just a filename
                const processedUrl = stored.startsWith('http') 
                    ? stored 
                    : `http://localhost:3001/uploads/profiles/${stored}`;
                setImgUrl(processedUrl);
            } else {
                setImgUrl(defaultProfile);
            }
        };

        // Listen for custom profile update event
        window.addEventListener('profileImageUpdated', handleProfileUpdate);
        
        // Also listen for storage changes (if opened in multiple tabs)
        window.addEventListener('storage', handleProfileUpdate);

        return () => {
            window.removeEventListener('profileImageUpdated', handleProfileUpdate);
            window.removeEventListener('storage', handleProfileUpdate);
        };
    }, [defaultProfile]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuref.current && !menuref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoClick = () => {
        navigate('/');
        setIsOpen(false); // Close mobile menu if open
    };

    const handleToggle = () => setIsOpen(prev => !prev);

    const handleProfileClick = () => {
        const token = localStorage.getItem("token");
        if (token) {
            // If user is logged in, use the global ProfileSidebar
            openProfileSidebar();
        } else {
            // Not logged in, go to login
            navigate("/login");
        }
    };

    const handleFAQClick = () => {
        const scrollToSection = () => {
            const faqSection = document.getElementById('faq-section');
            if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
        };
        if (window.location.pathname === '/') {
            scrollToSection();
        } else {
            navigate('/', { state: { scrollToFAQ: true } });
            setTimeout(scrollToSection, 500);
        }
        setIsOpen(false);
    };

    const handleContactUsClick = () => {
        const scrollToSection = () => {
            const section = document.getElementById('contactus-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        };
        if (window.location.pathname === '/') {
            scrollToSection();
        } else {
            navigate('/', { state: { scrollToContactUs: true } });
            setTimeout(scrollToSection, 500);
        }
        setIsOpen(false);
    };

    const getLinkClass = (path) => {
        const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
        return `decoration-3 hover:underline hover:decoration-red-600 hover:underline-offset-8 ${isActive ? 'underline underline-offset-8 decoration-red-600' : ''}`;
    };

    return (


        <nav className='sticky top-0 left-0 w-full h-14 md:h-16 bg-black flex justify-between items-center px-3 sm:px-4 xl:px-10 z-50'>
            {/* Logo */}
            <div className='h-20 w-20 sm:h-18 sm:w-18 md:h-24 md:w-24 flex-shrink-0 cursor-pointer touch-manipulation ml-4 sm:ml-3 md:ml-4' onClick={handleLogoClick}>
                <img src="/logo.png" alt="EasyWheels Logo" className="h-full w-full object-cover" />
            </div>

            {/* Desktop Navigation */}
            <div className='hidden xl:flex gap-6 lg:gap-8 items-center text-white text-base lg:text-lg'>
                <ul className='flex space-x-4 lg:space-x-6'>
                    <li><Link to="/" className={getLinkClass('/')}>Home</Link></li>
                    <li><Link to="/about" className={getLinkClass('/about')}>About us</Link></li>
                    <li><Link to="/vehicles" className={getLinkClass('/vehicles')}>Vehicles</Link></li>
                    <li><button onClick={handleContactUsClick} className="hover:underline decoration-3 hover:decoration-red-600 hover:underline-offset-8">Contact Us</button></li>
                    <li><button onClick={handleFAQClick} className="hover:underline decoration-3 hover:decoration-red-600 hover:underline-offset-8">FAQ</button></li>
                </ul>

                <button onClick={() => { handleToggle(); navigate("/add-vehicle")}}  className="border-0 px-3 lg:px-4 py-2 bg-red-600 text-white text-xs lg:text-sm rounded-2xl hover:scale-110 transition-transform duration-200 whitespace-nowrap">
                    Become a host
                </button>

                <button className='profile-icon' onClick={handleProfileClick}>
                    <img
                        src={imgUrl}
                        onError={(e) => {
                            e.currentTarget.src = defaultProfile;
                        }}



                        className='w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white border-2 border-gray-300'

                        alt="profile"
                    />
                </button>
            </div>

            {/* Mobile Menu Button */}
            <div className='xl:hidden flex items-center gap-2 sm:gap-3'>
                <button className='text-white touch-manipulation' onClick={handleProfileClick}>
                    <img
                        src={imgUrl}
                        onError={(e) => {
                            e.currentTarget.src = defaultProfile;
                        }}



                        className='w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-gray-300'

                        alt="profile"
                    />
                </button>


                <button className='text-white p-1 touch-manipulation' onClick={handleToggle} aria-label="Toggle menu">
                    {isOpen ? <IoClose className="text-2xl sm:text-3xl" /> : <IoMenu className="text-2xl sm:text-3xl" />}

                </button>
            </div>

            {/* Fullscreen Mobile Menu */}
            {isOpen && (
                <div
                    ref={menuref}
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-98 text-white flex flex-col items-center justify-center gap-8 text-lg sm:text-xl z-50 px-4"
                >
                    <button 
                        onClick={handleToggle} 
                        className="absolute top-4 right-4 text-white text-2xl sm:text-3xl p-2 touch-manipulation hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <IoClose />
                    </button>
                    
                    <div className="flex flex-col items-center gap-6 sm:gap-8 mt-8">
                        <Link 
                            to="/" 
                            onClick={handleToggle} 
                            className="hover:text-red-400 transition-colors py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/about" 
                            onClick={handleToggle} 
                            className="hover:text-red-400 transition-colors py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10"
                        >
                            About Us
                        </Link>
                        <Link 
                            to="/vehicles" 
                            onClick={handleToggle} 
                            className="hover:text-red-400 transition-colors py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10"
                        >
                            Vehicles
                        </Link>
                        <button 
                            onClick={handleContactUsClick} 
                            className="hover:text-red-400 transition-colors py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 touch-manipulation"
                        >
                            Contact Us
                        </button>
                        <button 
                            onClick={handleFAQClick} 
                            className="hover:text-red-400 transition-colors py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 touch-manipulation"
                        >
                            FAQ
                        </button>
                        <button 
                            onClick={() => { handleToggle(); navigate("/add-vehicle"); }} 
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl mt-4 transition-colors touch-manipulation font-medium"
                        >
                            Become a Host
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
