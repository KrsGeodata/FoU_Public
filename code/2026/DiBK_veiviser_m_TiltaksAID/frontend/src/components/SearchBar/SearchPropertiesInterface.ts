// Interface for the set of properties derived from an address search result,
// used to synchronize the map view and matrikkel geometry lookup.
export default interface SearchProperties{
  matrikkelNr?: string;
  address?: string;
  lon?: string;
  lat?: string;
  //error?: any; //Maybe use later for error message
  //boundingbox?: any;
}