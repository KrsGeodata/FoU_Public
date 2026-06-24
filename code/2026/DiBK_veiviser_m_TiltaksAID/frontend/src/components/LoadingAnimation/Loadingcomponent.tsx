// Full-screen loading overlay with a spinning indicator and status text.
// Displayed during async operations such as geometry analysis.
// Controlled by the `visible` prop; renders nothing when hidden.
import './LoadingAnimation.css'; // Import the CSS file

export default function LoadingAnimation({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

            {/* Spinner card */}
            <div className="relative flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-md shadow-2xl border border-white/60 w-72 aspect-[1.618/1]">

                {/* Animated ring */}
                <div className="relative rounded-full size-10">
                    <div className="absolute inset-0 rounded-full border-3 border-gray-200" />
                    <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary animate-spin" />
                </div>

                {/* Label */}
                <p className="text-sm font-medium text-primary tracking-wide">
                    Laster geometri
                </p>
                 <p className="text-xs text-neutral-400 dark:text-neutral-500">Vennligst vent...</p>
            </div>
        </div>
    );
}