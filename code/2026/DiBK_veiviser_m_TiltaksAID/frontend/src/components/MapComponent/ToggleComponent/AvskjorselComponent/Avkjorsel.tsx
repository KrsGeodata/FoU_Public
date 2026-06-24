// Toggle switch for showing/hiding road exit points (avkjørsler) on the map.
// Displays an error message in place of the label when data fetching fails.
import Switch from "@mui/material/Switch";

interface ToggleAvkjorselProps{
    errorMessage?: string,
    isAvkjorsel: boolean,
    onToggle: (isAvkjorsel: boolean) => void,
}

export default function ToggleAvkjorsel({errorMessage ,isAvkjorsel, onToggle}: ToggleAvkjorselProps){

const handleAvkjorselToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked);
}

   return(
<div className="flex caret-transparent align-items-center mb-2 shrink-0">
   {
    !errorMessage && (
        <label className="text-black flex align-items-center cursor-none user-select-none m-0">
        <Switch
        type="checkbox"
        checked={isAvkjorsel}
        onChange={handleAvkjorselToggle}
        size="small"
        className="m-0 mr-2 cursor-pointer"
        />
        <span className="text-sm font-medium hover:text-[#FF5722]">
        Vis alle avkjorsler  
        </span>
    </label>
    )
   } 

{
    errorMessage && (
    <label className="text-black flex align-items-center cursor-none user-select-none m-0">
        <Switch 
        type="checkbox"
        checked={isAvkjorsel}
        onChange={handleAvkjorselToggle}
        size="small"
        className="m-0 mr-2 cursor-pointer"
        />
        <span className="text-sm font-medium hover:text-[#FF5722]">
        {errorMessage} 
        </span>
    </label>)
}
</div>
);
}