// Toggle switch for showing/hiding the FKB building footprint WMS layer on the map.
import Switch from "@mui/material/Switch"
interface ToggleFkbProps {
    isFkb: boolean,
    onToggle: (isFkb: boolean) => void,

}


export default function ToggleFKB({isFkb, onToggle}: ToggleFkbProps){

const handleFkbToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked);
}



return(
<div className="flex caret-transparent align-items-center mb-2 shrink-0">
    <label className="text-black flex items-center cursor-none user-selected-none m-0">
        <Switch
        type="checkbox"
        checked={isFkb}
        onChange={handleFkbToggle}
        size="small"
        className="m-0 mr-2 cursor-pointer"
        />
        <span className="text-sm font-medium hover:text-[#FF5722]">
            Vis FKB grunnlag
        </span>
    </label>
</div>
);

}