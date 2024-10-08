interface NavBarProps {
    onNavClick: (section: string) => void;
    isAuthenticated: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ onNavClick, isAuthenticated }) => {
    return (
        <nav className="bg-green-500 p-4 flex justify-around items-center shadow-md">  {/* Tailwind styles */}
            <button onClick={() => onNavClick('events')} className="text-white hover:bg-green-700 py-2 px-4 rounded">
                Events
            </button>
            <button onClick={() => onNavClick('host')} className="text-white hover:bg-green-700 py-2 px-4 rounded">
                Host Event
            </button>
            <button onClick={() => onNavClick('friends')} className="text-white hover:bg-green-700 py-2 px-4 rounded">
                Friends
            </button>
            <button onClick={() => onNavClick('notifications')} className="text-white hover:bg-green-700 py-2 px-4 rounded">
                Notifications
            </button>
            {isAuthenticated ? (
                <button onClick={() => onNavClick('logout')} className="text-white hover:bg-red-700 py-2 px-4 rounded">
                    Logout
                </button>
            ) : (
                <>
                    <button onClick={() => onNavClick('login')} className="text-white hover:bg-blue-700 py-2 px-4 rounded">
                        Login
                    </button>
                    <button onClick={() => onNavClick('signup')} className="text-white hover:bg-blue-700 py-2 px-4 rounded">
                        Sign Up
                    </button>
                </>
            )}
        </nav>
    );
};

export default NavBar;



