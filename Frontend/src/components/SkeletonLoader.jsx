const SkeletonLoader = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
            <div className="flex justify-between items-center mb-6">
                <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="h-8 bg-slate-100 rounded-lg w-full mb-4"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-slate-50 rounded-xl w-full"></div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
