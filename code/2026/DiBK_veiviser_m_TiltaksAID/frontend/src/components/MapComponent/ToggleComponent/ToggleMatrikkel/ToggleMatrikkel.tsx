// Toggle switch for showing/hiding the cadastral (matrikkel) WMS background layer.
import Switch from "@mui/material/Switch";

interface ToggleMenuProps { //setting up type for typescript
    isMatrikkel: boolean;
    onToggle: (isMatrikkel: boolean) => void;
}

export default function ToggleMatrikkel({isMatrikkel, onToggle}: ToggleMenuProps) { 
    //Values we are going to export to another component
    //Two argument, one that is boolean as decleared above, 
    // second is taking a void method (we are not expecting any value) from the component we are exporting to
    //however, notice the onToggle void method is still expecting boolean, but we are ignoring return value
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked);
  };


  return (
    <div className="flex caret-transparent align-items-center mb-2 shrink-0">
      <label className="text-black flex align-items-center cursor-none user-select-none m-0">
        <Switch
          type="checkbox"
          checked={isMatrikkel}
          onChange={handleToggle}
          size="small"
          className="m-0 mr-2 cursor-pointer"
        />
        <span className="text-sm font-medium hover:text-[#FF5722]">
          Vis matrikkel bakgrunnslag
        </span>
      </label>
    </div>
  );
}