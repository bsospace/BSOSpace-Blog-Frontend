const BackButton = () => {
    const handleBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };

    return (
        <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-600 transition-all"
        >
            Back
        </button>
    );
};

export default BackButton;