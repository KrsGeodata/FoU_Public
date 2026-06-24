// Toggle switch for showing/hiding the landslide/flood hazard zone WMS layer.
import Switch from "@mui/material/Switch"
interface ToggleProps {
    isJordskred: boolean,
    onToggle: (isJordskred: boolean) => void,
}


export default function ToggleJordskred({isJordskred, onToggle}: ToggleProps){

const handleJordkredToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked);
}



return(
<div className="flex caret-transparent align-items-center mb-2 shrink-0">
    <label className="text-black flex items-center cursor-none user-selected-none m-0">
        <Switch
        type="checkbox"
        checked={isJordskred}
        onChange={handleJordkredToggle}
        size="small"
        className="m-0 mr-2 cursor-pointer"
        />
        <span className="text-sm font-medium hover:text-[#FF5722]">
            Skredfare område - Test (Zoom ut!)
        </span>
    </label>
</div>
);

}