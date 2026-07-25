import { useContext } from "react";

import ThemeContext from "../context/ThemeContextValue";

function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
