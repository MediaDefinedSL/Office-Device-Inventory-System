import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex print:bg-white relative relative w-full overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col ml-0 md:ml-64 print:ml-0 transition-all duration-300 w-full md:w-[calc(100%-16rem)] min-w-0">
                <Topbar setIsSidebarOpen={setIsSidebarOpen} />
                <main className="p-4 md:p-8 print:p-0 overflow-x-hidden w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
