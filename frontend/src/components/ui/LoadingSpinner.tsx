export const LoadingSpinner = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen p-8" : "min-h-[400px] p-8"}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const FullPageLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const InlineLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};
