import React from 'react';
import Navbar from './Navbar';
import { GiEagleHead } from "react-icons/gi";

function Header({setIsAuthenticated}) {
    return (
        <header className="relative bg-gray-800 text-white p-4">
            <div className="flex items-center space-x-6 absolute">
                <GiEagleHead className="w-12 h-12"/>
                <h1 className="text-2xl">Eagle Vision</h1>
            </div>
            <Navbar setIsAuthenticated={setIsAuthenticated}/>
        </header>
    );
}

export default Header;
