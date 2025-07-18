import { useState, useRef, useEffect } from 'react';
import { IoMenu, IoClose } from "react-icons/io5";
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [imgUrl, setImgUrl] = useState(""); // Dynamic profile image
    const menuref = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const defaultProfile = "https://imgs.search.brave.com/XfEYZ8GiGdxGCdS_JsblVMJV7ufqdKMwU1a9uPFGtjg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNS9Qcm9m/aWxlLVBORy1GcmVl/LUltYWdlLnBuZw";

    useEffect(() => {
        const stored = localStorage.getItem("profileImg");
        if (stored && stored.trim() !== "") {
            setImgUrl(stored);
        } else {
            setImgUrl(defaultProfile);
        }
    }, []);

    // Listen for profile image updates
    useEffect(() => {
        const handleProfileUpdate = () => {
            const stored = localStorage.getItem("profileImg");
            console.log('Profile image updated, new URL:', stored); // Debug log
            if (stored && stored.trim() !== "") {
                setImgUrl(stored);
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
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuref.current && !menuref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(prev => !prev);

    const handleProfileClick = () => {
        const token = localStorage.getItem("token");
        navigate(token ? "/profile" : "/login");
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
        <nav className='sticky top-0 left-0 w-full h-16 bg-black flex justify-around md:px:10 sm:justify-between items-center px-2 sm:px-4   xl:px-10 z-50'>
            {/* Logo */}
            <div className='h-20 w-20 sm:h-20 sm:w-20'>
                <img src="/logo.png" alt="EasyWheels Logo" className="h-full w-full object-cover" />
            </div>

            {/* Desktop Navigation */}
            <div className='hidden xl:flex gap-8 items-center text-white text-lg'>
                <ul className='flex space-x-6'>
                    <li><Link to="/" className={getLinkClass('/')}>Home</Link></li>
                    <li><Link to="/about" className={getLinkClass('/about')}>About us</Link></li>
                    <li><Link to="/browse" className={getLinkClass('/browse')}>Vehicles</Link></li>
                    <li><button onClick={handleContactUsClick} className="hover:underline decoration-3 hover:decoration-red-600 hover:underline-offset-8">Contact Us</button></li>
                    <li><button onClick={handleFAQClick} className="hover:underline decoration-3 hover:decoration-red-600 hover:underline-offset-8">FAQ</button></li>
                </ul>

                <button onClick={() => { handleToggle(); navigate("/add-vehicle")}}  className="border-0 px-4 py-2 bg-red-600 text-white text-sm rounded-2xl hover:scale-110 transition-transform duration-200">
                    Become a host
                </button>

                <button className='profile-icon' onClick={handleProfileClick}>
                    <img
                        src={imgUrl}
                        onError={(e) => e.currentTarget.src = defaultProfile}
                        className='w-10 h-10 rounded-full bg-white'
                        alt="profile"
                    />
                </button>
            </div>

            {/* Mobile Menu Button */}
            <div className='xl:hidden flex items-center gap-3'>
                <button className='text-white' onClick={handleProfileClick}>
                    <img
                        src={imgUrl}
                        onError={(e) => e.currentTarget.src = defaultProfile}
                        className='w-9 h-9 rounded-full bg-white'
                        alt="profile"
                    />
                </button>

                <button className='text-white mr-1' onClick={handleToggle}>
                    {isOpen ? <IoClose className="text-3xl" /> : <IoMenu className="text-3xl" />}
                </button>
            </div>

            {/* Fullscreen Mobile Menu */}
            {isOpen && (
                <div
                    ref={menuref}
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-95 text-white flex flex-col items-center justify-center gap-6 text-xl z-50"
                >
                    <button onClick={handleToggle} className="absolute top-4 right-4 text-white text-3xl">
                        <IoClose />
                    </button>
                    <Link to="/" onClick={handleToggle} className="hover:text-red-400">Home</Link>
                    <Link to="/about" onClick={handleToggle} className="hover:text-red-400">About Us</Link>
                    <Link to="/browse" onClick={handleToggle} className="hover:text-red-400">Vehicles</Link>
                    <button onClick={handleContactUsClick} className="hover:text-red-400">Contact Us</button>
                    <button onClick={handleFAQClick} className="hover:text-red-400">FAQ</button>
                    <button onClick={() => { handleToggle(); navigate("/add-vehicle"); }} className="bg-red-600 text-white px-4 py-2 rounded-xl mt-4">
                        Become a Host
                    </button>
                </div>
            )}
        </nav>
    );
}
